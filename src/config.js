// Central place to tweak branding / target dashboard without hunting through screens.

export const COLORS = {
  primary: '#2ECC9A',
  primaryDark: '#27AE96',
  background: '#0d1420',
  surface: '#1a2332',
  border: 'rgba(255,255,255,0.08)',
  text: '#e8eaed',
  textMuted: '#90a4c0',
};

export const BRAND = {
  name: 'MJ tap&move',
  subtitle: '천안FVT유산양목장',
};

// The Home Assistant dashboard's url_path + default view (see mj-panel dashboard).
// Change this if the dashboard's url_path or default view ever changes.
export const DASHBOARD_PATH = '/mj-panel/home';

export const KAKAO = {
  link: 'https://open.kakao.com/o/sun68uEi',
};

export const STORAGE_KEYS = {
  serverAddress: '@mj_server_address',
  token: '@mj_token',
  tokenPromptDismissCount: '@mj_token_prompt_dismiss_count',
  updateDismissedDate: '@mj_update_dismissed_date',
};
