const config = {
  projectName: 'kefu-fe-app',
  date: '2021-9-7',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {
  },
  copy: {
    patterns: [
      {from: 'src/components/trtc-room/static', to: 'dist/components/trtc-room/static'},
      {from: 'src/components/trtc-room/template/', to: 'dist/components/trtc-room/template/'},
      {from: 'src/components/trtc-room/trtc-room.wxml', to: 'dist/components/trtc-room/trtc-room.wxml'},
      {from: 'src/components/trtc-room/trtc-room.wxss', to: 'dist/components/trtc-room/trtc-room.wxss'}
    ],
    options: {
    }
  },
  weapp: {
    compile: {
      // exclude: ['src/components/trtc-room/trtc-room.js']
    },
    module: {
    }
  },
  framework: 'react',
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {

        }
      },
      url: {
        enable: true,
        config: {
          limit: 10240 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
