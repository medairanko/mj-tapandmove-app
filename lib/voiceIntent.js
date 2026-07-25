// Korean voice-command parsing: action keyword extraction + entity name matching
// against the live HA entity list. Pure functions, no native deps.

// Longest keyword first so "켜줘" is matched before the bare "켜".
const ACTION_KEYWORDS = [
  { keyword: '켜줘', action: 'turn_on' },
  { keyword: '켜', action: 'turn_on' },
  { keyword: '온', action: 'turn_on' },
  { keyword: '꺼줘', action: 'turn_off' },
  { keyword: '꺼', action: 'turn_off' },
  { keyword: '오프', action: 'turn_off' },
  { keyword: '올려', action: 'open' },
  { keyword: '열어', action: 'open' },
  { keyword: '내려', action: 'close' },
  { keyword: '닫아', action: 'close' },
].sort((a, b) => b.keyword.length - a.keyword.length);

export const ACTION_LABEL_KR = {
  turn_on: '켜기',
  turn_off: '끄기',
  open: '열기',
  close: '닫기',
};

// Maps a parsed action -> HA service name, per entity domain.
// "turn_on"/"turn_off" apply to light/switch/fan directly; on a cover they mean open/close.
// "open"/"close" only make sense for covers.
const SERVICE_MAP = {
  turn_on: { default: 'turn_on', cover: 'open_cover' },
  turn_off: { default: 'turn_off', cover: 'close_cover' },
  open: { cover: 'open_cover' },
  close: { cover: 'close_cover' },
};

const FUZZY_THRESHOLD = 0.34; // max allowed (edit distance / name length) for a fuzzy match

export function normalize(text) {
  return (text || '').trim().replace(/\s+/g, '').toLowerCase();
}

export function extractAction(normalizedText) {
  for (const { keyword, action } of ACTION_KEYWORDS) {
    if (normalizedText.includes(keyword)) {
      return { action, remainder: normalizedText.split(keyword).join('') };
    }
  }
  return null;
}

function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const dp = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) dp[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[b.length];
}

export function resolveService(action, domain) {
  const map = SERVICE_MAP[action];
  if (!map) return null;
  return map[domain] || map.default || null;
}

// entities: [{entity_id, friendly_name, domain}], spokenRemainder: normalized text
// with the action keyword already removed.
export function findBestEntityMatch(spokenRemainder, entities) {
  if (!spokenRemainder || entities.length === 0) return null;

  const exactMatches = entities.filter((entity) => {
    const name = normalize(entity.friendly_name);
    return name.length > 0 && (spokenRemainder.includes(name) || name.includes(spokenRemainder));
  });

  if (exactMatches.length > 0) {
    // Prefer the most specific (longest) matching name over a short generic one.
    exactMatches.sort((a, b) => normalize(b.friendly_name).length - normalize(a.friendly_name).length);
    return exactMatches[0];
  }

  let best = null;
  let bestScore = Infinity;
  for (const entity of entities) {
    const name = normalize(entity.friendly_name);
    if (!name) continue;
    const distance = levenshtein(spokenRemainder, name);
    const score = distance / Math.max(name.length, spokenRemainder.length);
    if (score < bestScore) {
      bestScore = score;
      best = entity;
    }
  }

  return bestScore <= FUZZY_THRESHOLD ? best : null;
}

// Full pipeline: raw recognized speech + live entity list -> actionable command, or null
// if either the action or the entity couldn't be confidently resolved.
export function matchVoiceCommand(recognizedText, entities) {
  const normalized = normalize(recognizedText);
  const extracted = extractAction(normalized);
  if (!extracted) return null;

  const entity = findBestEntityMatch(extracted.remainder, entities);
  if (!entity) return null;

  const service = resolveService(extracted.action, entity.domain);
  if (!service) return null;

  return {
    entity,
    action: extracted.action,
    actionLabel: ACTION_LABEL_KR[extracted.action],
    service,
  };
}
