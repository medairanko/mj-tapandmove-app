import appJson from '../app.json';

const VERSION_CHECK_URL = 'https://app.mjsmart.co.kr/version.json';
const FETCH_TIMEOUT_MS = 8000;

const CURRENT_VERSION_CODE = appJson.expo.android.versionCode;

export function getTodayDateString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function checkForUpdate() {
  if (__DEV__) {
    console.log('[update][debug] checkForUpdate() fetching:', VERSION_CHECK_URL);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(VERSION_CHECK_URL, { signal: controller.signal });

    if (!response.ok) {
      if (__DEV__) {
        console.log('[update][debug] response not ok:', response.status, response.statusText);
      }
      return { updateAvailable: false };
    }

    const data = await response.json();
    const { latestVersionCode, apkUrl } = data;

    if (__DEV__) {
      console.log(
        '[update][debug] raw latestVersionCode:',
        latestVersionCode,
        '| type:',
        typeof latestVersionCode,
        '| apkUrl present:',
        !!apkUrl
      );
    }

    const latestVersionCodeNum = Number(latestVersionCode);
    const installedVersionCodeNum = Number(CURRENT_VERSION_CODE);

    if (__DEV__) {
      console.log('[update][debug] installed versionCode:', installedVersionCodeNum);
    }

    if (Number.isNaN(latestVersionCodeNum) || !apkUrl) {
      if (__DEV__) {
        console.log('[update][debug] invalid payload (bad versionCode or missing apkUrl), treating as no update');
      }
      return { updateAvailable: false };
    }

    const updateAvailable = latestVersionCodeNum > installedVersionCodeNum;

    if (__DEV__) {
      console.log(
        `[update][debug] comparison: ${latestVersionCodeNum} > ${installedVersionCodeNum} =`,
        updateAvailable
      );
    }

    if (!updateAvailable) {
      return { updateAvailable: false };
    }

    return {
      updateAvailable: true,
      apkUrl,
      releaseNotes: data.releaseNotes || '',
    };
  } catch (e) {
    if (e.name === 'AbortError') {
      console.warn('[update] checkForUpdate() timed out after', FETCH_TIMEOUT_MS, 'ms');
    } else {
      console.warn('[update] checkForUpdate() failed:', e.message);
    }
    // Fail gracefully: no internet / server down must never affect normal app usage.
    return { updateAvailable: false };
  } finally {
    clearTimeout(timeoutId);
  }
}
