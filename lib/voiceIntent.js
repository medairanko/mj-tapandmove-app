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

// Domain gating: which entity domains an action is even allowed to consider, BEFORE any
// substring/fuzzy matching runs. This prevents e.g. a "turn on" utterance from ever
// resolving to a cover just because a cover's name happens to fuzzy-match more closely
// than the intended light/switch (and vice versa for open/close vs. covers).
const ACTION_ELIGIBLE_DOMAINS = {
  turn_on: ['light', 'switch', 'fan'],
  turn_off: ['light', 'switch', 'fan'],
  open: ['cover'],
  close: ['cover'],
};

export function getEligibleDomains(action) {
  return ACTION_ELIGIBLE_DOMAINS[action] || [];
}

// Max allowed (edit distance / name length) for a fuzzy match. Loosened from 0.34 to 0.42
// (~24% more tolerance) because correctly-heard commands were routinely failing on a
// single mis-transcribed/dropped syllable and needing 3-4 repeats. Safe to loosen because
// action-domain-gating (see ACTION_ELIGIBLE_DOMAINS) already restricts the candidate pool
// to same-purpose entities (e.g. a "turn on" command can never even consider a cover) --
// this threshold only decides *which light/switch/fan* (or *which cover*) within an
// already-correct domain, not whether the domain itself is right.
const FUZZY_THRESHOLD = 0.42;

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

// Extracts the Korean label inside parentheses when present -- e.g.
// "switch 3(중앙) Switch 1" -> "중앙", "room light(방등) Switch 1" -> "방등".
// Falls back to the full friendly_name when there's no parenthetical (some entities,
// e.g. "cow outlet", are already a bare label with no English/Korean split). Matching
// runs against this key instead of the raw friendly_name -- comparing a short spoken
// Korean word against a long mixed English+Korean string made Levenshtein distance
// blow up and fuzzy matching never pass.
export function extractMatchKey(friendlyName) {
  const match = (friendlyName || '').match(/\(([^)]+)\)/);
  return match ? match[1] : friendlyName;
}

// entities: [{entity_id, friendly_name, domain}], spokenRemainder: normalized text
// with the action keyword already removed.
export function findBestEntityMatch(spokenRemainder, entities) {
  if (!spokenRemainder || entities.length === 0) return null;

  const exactMatches = entities.filter((entity) => {
    const name = normalize(extractMatchKey(entity.friendly_name));
    return name.length > 0 && (spokenRemainder.includes(name) || name.includes(spokenRemainder));
  });

  if (exactMatches.length > 0) {
    // Prefer the most specific (longest) matching name over a short generic one.
    exactMatches.sort(
      (a, b) =>
        normalize(extractMatchKey(b.friendly_name)).length - normalize(extractMatchKey(a.friendly_name)).length
    );
    const topLength = normalize(extractMatchKey(exactMatches[0].friendly_name)).length;
    const tiedAtTop = exactMatches.filter(
      (entity) => normalize(extractMatchKey(entity.friendly_name)).length === topLength
    );
    if (tiedAtTop.length > 1) return null; // genuine tie — don't guess
    return exactMatches[0];
  }

  let best = null;
  let bestScore = Infinity;
  let tie = false;
  for (const entity of entities) {
    const name = normalize(extractMatchKey(entity.friendly_name));
    if (!name) continue;
    const distance = levenshtein(spokenRemainder, name);
    const score = distance / Math.max(name.length, spokenRemainder.length);
    if (score < bestScore) {
      bestScore = score;
      best = entity;
      tie = false;
    } else if (score === bestScore) {
      tie = true;
    }
  }

  if (bestScore > FUZZY_THRESHOLD) return null;
  return tie ? null : best; // genuine tie — don't guess
}

// Debug helper: scores every entity against spokenRemainder (substring match, then
// Levenshtein-based fuzzy score) and returns the top N regardless of threshold, so
// callers can see near-misses. Not used by the production matching pipeline.
export function debugMatchCandidates(spokenRemainder, entities, limit = 3) {
  return entities
    .map((entity) => {
      const matchKey = extractMatchKey(entity.friendly_name);
      const name = normalize(matchKey);
      const isSubstring = name.length > 0 && (spokenRemainder.includes(name) || name.includes(spokenRemainder));
      const distance = levenshtein(spokenRemainder, name);
      const score = name.length ? Number((distance / Math.max(name.length, spokenRemainder.length)).toFixed(3)) : null;
      return {
        entity_id: entity.entity_id,
        friendly_name: entity.friendly_name,
        matchKey,
        matchType: isSubstring ? 'substring' : 'fuzzy',
        score,
        passesFuzzyThreshold: score !== null && score <= FUZZY_THRESHOLD,
      };
    })
    .sort((a, b) => {
      if (a.matchType !== b.matchType) return a.matchType === 'substring' ? -1 : 1;
      return (a.score ?? Infinity) - (b.score ?? Infinity);
    })
    .slice(0, limit);
}

// Full pipeline: raw recognized speech + live entity list -> actionable command, or null
// if either the action or the entity couldn't be confidently resolved.
export function matchVoiceCommand(recognizedText, entities) {
  const normalized = normalize(recognizedText);
  const extracted = extractAction(normalized);
  if (!extracted) return null;

  const eligibleDomains = getEligibleDomains(extracted.action);
  const candidatePool = entities.filter((entity) => eligibleDomains.includes(entity.domain));

  const entity = findBestEntityMatch(extracted.remainder, candidatePool);
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
