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
    target: 'es6',
    devtool: 'eval',
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif|wasm)$/i,
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