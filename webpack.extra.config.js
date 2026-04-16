const webpack = require('webpack');

module.exports = {
  devtool: false,
  plugins: [
    // Chỉ load locale tiếng Việt, bỏ qua toàn bộ dynamic require của moment.js
    new webpack.ContextReplacementPlugin(
      /moment[/\\]locale$/,
      /vi/
    ),
  ],
};
