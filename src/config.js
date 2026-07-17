// Central place to tweak branding / target dashboard without hunting through screens.

export const DARK_COLORS = {
  primary: '#2ECC9A',
  primaryDark: '#27AE96',
  background: '#0d1420',
  surface: '#1a2332',
  border: 'rgba(255,255,255,0.08)',
  text: '#e8eaed',
  textMuted: '#90a4c0',
};

export const LIGHT_COLORS = {
  primary: '#2ECC9A',
  primaryDark: '#27AE96',
  background: '#f2f4f7',
  surface: '#ffffff',
  border: 'rgba(13,20,32,0.1)',
  text: '#0d1420',
  textMuted: '#5a6b85',
};

// Back-compat alias for any code that still imports the static dark palette directly.
export const COLORS = DARK_COLORS;

export function getColors(theme) {
  return theme === 'light' ? LIGHT_COLORS : DARK_COLORS;
}

export const BRAND = {
  name: 'MJ tap&move',
  subtitle: '스마트 농장 시스템',
};

// The Home Assistant dashboard's url_path + default view (see mj-panel dashboard).
// Change this if the dashboard's url_path or default view ever changes.
export const DASHBOARD_PATH = '/mj-panel/home';

export const KAKAO = {
  contactUrl: 'https://open.kakao.com/o/medapersian77',
  adminUrl: 'https://open.kakao.com/o/medapersian77',
};

export const STORAGE_KEYS = {
  serverAddress: '@mj_server_address',
  token: '@mj_token',
  theme: '@mj_theme',
};
