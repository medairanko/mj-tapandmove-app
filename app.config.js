// Dynamic config layered on top of app.json. Only active for the "development" EAS
// build profile (via APP_VARIANT, set in eas.json) — gives dev-client builds a distinct
// applicationId + app name so they install alongside the production app instead of
// overwriting it. Preview/production builds are untouched (config passes through as-is).
const IS_DEV = process.env.APP_VARIANT === 'development';

module.exports = ({ config }) => {
  if (!IS_DEV) {
    return config;
  }

  return {
    ...config,
    name: `${config.name} (Dev)`,
    android: {
      ...config.android,
      package: `${config.android.package}.dev`,
    },
  };
};
