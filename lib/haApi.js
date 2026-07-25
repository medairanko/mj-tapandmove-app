// Home Assistant REST API client. No external HTTP dependency — just fetch().

const VOICE_CONTROLLABLE_DOMAINS = ['light', 'switch', 'cover', 'fan'];

export function getBaseUrl(rawAddress) {
  const host = rawAddress.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  return `https://${host}`;
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// Fetches /api/states and reduces it to the domains a voice command can act on.
export async function getStates(serverAddress, token) {
  const url = `${getBaseUrl(serverAddress)}/api/states`;
  if (__DEV__) {
    console.log('[haApi][debug] getStates() base URL:', getBaseUrl(serverAddress));
    console.log(
      '[haApi][debug] getStates() token present:',
      !!token,
      '| token length:',
      token ? token.length : 0
    );
  }

  const res = await fetch(url, { headers: authHeaders(token) });

  if (__DEV__) {
    console.log('[haApi][debug] GET /api/states response status:', res.status, res.statusText);
  }

  if (!res.ok) {
    if (__DEV__) {
      const bodyText = await res.clone().text().catch((e) => `<failed to read body: ${e.message}>`);
      console.log('[haApi][debug] GET /api/states error body:', bodyText);
    }
    throw new Error(`HA states fetch failed: ${res.status}`);
  }

  const states = await res.json();
  if (__DEV__) {
    console.log('[haApi][debug] raw entity count before domain filtering:', states.length);
  }

  return states
    .filter((entity) => VOICE_CONTROLLABLE_DOMAINS.includes(entity.entity_id.split('.')[0]))
    .map((entity) => ({
      entity_id: entity.entity_id,
      friendly_name: entity.attributes?.friendly_name || entity.entity_id,
      domain: entity.entity_id.split('.')[0],
    }));
}

export async function callService(serverAddress, token, domain, service, entityId) {
  const res = await fetch(`${getBaseUrl(serverAddress)}/api/services/${domain}/${service}`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ entity_id: entityId }),
  });
  if (!res.ok) {
    throw new Error(`HA service call failed: ${res.status}`);
  }
  return res.json();
}
