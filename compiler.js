const MemoryFs = require('memory-fs')
const webpack = require('webpack')

function compile(scriptPath) {
  const compiler = webpack({
    output: {
      filename: 'bundle.js',
      path: '/'
    },
    mode: 'development',
    entry: scriptPath,
    target: 'webworker',
    devtool: 'eval',
    module: {
      rules: [
        {
          test: /\.wasm$/,
          use: ['@scytheapp/arraybuffer-loader']
        }
      ]
    }
  })

  compiler.outputFileSystem = new MemoryFs()

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err)

      if (stats.hasErrors() || stats.hasWarnings()) {
        return reject(new Error(stats.toString({
          errorDetails: false,
          warnings: true
        })))
      }

      const result = compiler.outputFileSystem.data['bundle.js'].toString()
      resolve({ result, stats })
    })
  })
}

module.exports = {
  compile
}