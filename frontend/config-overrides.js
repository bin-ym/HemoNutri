// frontend/config-overrides.js
module.exports = function override(config) {
  config.resolve.fallback = {
    http: false,
    https: false,
    util: false,
    zlib: false,
    stream: false,
    url: false,
    crypto: false,
    assert: false,
  };
  return config;
};