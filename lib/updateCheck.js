import appJson from '../app.json';

const VERSION_CHECK_URL = 'https://app.mjsmart.co.kr/version.json';

const CURRENT_VERSION_CODE = appJson.expo.android.versionCode;

export function getTodayDateString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function checkForUpdate() {
  try {
    const response = await fetch(VERSION_CHECK_URL);
    if (!response.ok) {
      return { updateAvailable: false };
    }

    const data = await response.json();
    const { latestVersionCode, apkUrl } = data;

    if (typeof latestVersionCode !== 'number' || !apkUrl) {
      return { updateAvailable: false };
    }

    if (latestVersionCode <= CURRENT_VERSION_CODE) {
      return { updateAvailable: false };
    }

    return {
      updateAvailable: true,
      apkUrl,
      releaseNotes: data.releaseNotes || '',
    };
  } catch (e) {
    // Silent by design: no internet / server down must never affect normal app usage.
    return { updateAvailable: false };
  }
}
