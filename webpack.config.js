const path = require('path')

module.exports = {
  mode: 'production',
  entry: './project/index.js',
  target: 'es6',
  devtool: 'eval',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: './project/'
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        use: ['@scytheapp/arraybuffer-loader']
      }
    ]
  }
}
