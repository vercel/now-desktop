// Native
const path = require('path')

// Packages
const webpack = require('webpack')
const LiveReloadPlugin = require('webpack-livereload-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const cssNano = require('cssnano')
const cssImport = require('postcss-import')

const outputPath = path.join(__dirname, 'app', 'dist')
const nodeEnv = process.env.NODE_ENV || 'development'

module.exports = [
  {
    name: 'react',
    entry: './src/renderer/index.jsx',
    target: 'web',
    output: {
      path: outputPath,
      filename: 'renderer.js'
    },
    externals(context, request, callback) {
      let isExternal = false

      const load = [
        'electron',
        'electron-config',
        'fs-promise',
        'now-client',
        'child_process',
        'time-ago'
      ]

      if (load.includes(request)) {
        isExternal = 'require("' + request + '")'
      }

      callback(null, isExternal)
    },
    module: {
      loaders: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: 'babel',
          query: {
            cacheDirectory: true,
            presets: [
              'react'
            ],
            plugins: [
              'transform-es2015-modules-commonjs',
              'transform-async-to-generator'
            ]
          }
        },
        {
          test: /\.json/,
          loader: 'json'
        },
        {
          test: /\.svg$/,
          loader: 'raw-loader'
        }
      ]
    },
    resolve: {
      extensions: [
        '',
        '.svg',
        '.js',
        '.jsx',
        '.json'
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(nodeEnv)
        }
      }),
      new LiveReloadPlugin()
    ]
  },
  {
    name: 'electron',
    entry: './src/main/index.js',
    target: 'electron',
    output: {
      path: outputPath,
      filename: 'main.js'
    },
    node: {
      __dirname: true
    },
    externals(context, request, callback) {
      callback(null, request.charAt(0) === '.' ? false : 'require("' + request + '")')
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel',
          query: {
            cacheDirectory: true,
            plugins: [
              'transform-es2015-modules-commonjs',
              'transform-async-to-generator'
            ]
          }
        },
        {
          test: /\.json/,
          loader: 'json'
        }
      ]
    }
  },
  {
    name: 'icons',
    output: {
      path: path.join(outputPath, 'icons'),
      filename: '*'
    },
    plugins: [
      new CopyWebpackPlugin([
        {
          from: 'build/icon.icns'
        },
        {
          from: 'build/icon.ico'
        }
      ])
    ]
  },
  {
    name: 'styles',
    entry: './src/renderer/styles/app.css',
    output: {
      path: outputPath,
      filename: 'styles.js'
    },
    module: {
      loaders: [
        {
          test: /\.css$/,
          loader: 'style-loader!css-loader!postcss-loader'
        }
      ]
    },
    postcss() {
      return [
        cssImport,
        cssNano
      ]
    },
    plugins: [
      new LiveReloadPlugin()
    ]
  }
]
