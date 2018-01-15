const path = require('path');

module.exports = {
  entry: './src/autoCompleteHelper.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        modules: 'amd'
      }
    }]
  }
};