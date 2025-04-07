const path = require("path");

module.exports = {
  resolve: {
    fallback: {
      "fs": false, // Mock fs as it’s not needed in the browser
      "os": require.resolve("os-browserify/browser"),
      "crypto": require.resolve("crypto-browserify"),
    },
  },
};