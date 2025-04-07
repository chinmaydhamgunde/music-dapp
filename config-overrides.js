module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    stream: require.resolve("stream-browserify"),
    path: require.resolve("path-browserify"),
  };
  return config;
};