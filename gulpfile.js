const { src, dest, parallel, series, watch } = require('gulp')

const del = require('del')
const browserSync = require('browser-sync')

// const plugins.sass = require('gulp-sass')
// const plugins.babel = require('gulp-babel')
// const plugins.swig = require('gulp-swig')
// const plugins.imagemin = require('gulp-imagemin')

const loadPlugins = require('gulp-load-plugins')

const plugins = loadPlugins()

const bs = browserSync.create()

const data = {
  menus: [
    {
      name: 'Home',
      icon: 'aperture',
      link: 'index.html',
    },
    {
      name: 'Features',
      link: 'features.html',
    },
    {
      name: 'About',
      link: 'about.html',
    },
    {
      name: 'Contact',
      link: '#',
      children: [
        {
          name: 'Twitter',
          link: 'https://twitter.com/w_harl',
        },
        {
          name: 'About',
          link: 'https://weibo.com/harlme',
        },
        {
          name: 'divider',
        },
        {
          name: 'About',
          link: 'https://github.com/harl',
        },
      ],
    },
  ],
  pkg: require('./package.json'),
  date: new Date(),
}

const clean = () => {
  return del(['dist', 'temp'])
}

const style = () => {
  return src('src/assets/styles/*.scss', { base: 'src' })
    .pipe(plugins.sass({ outputStyle: 'expanded' }))
    .pipe(dest('temp'))
}

const script = () => {
  return src('src/assets/scripts/*.js', { base: 'src' })
    .pipe(
      plugins.babel({
        presets: ['@babel/preset-env'],
      })
    )
    .pipe(dest('temp'))
}

const page = () => {
  // 两个 * 遍历查找所有子目录中符合的文件
  return src('src/*.html', { base: 'src' })
    .pipe(plugins.swig({ data, defaults: { cache: false } }))
    .pipe(dest('temp'))
}

const image = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

// imagemin处理字体的svg格式，其他处理不了的格式，会原样拷贝过去
const font = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const extra = () => {
  return src('public', { base: 'public' }).pipe(dest('dist'))
}

const serve = () => {
  watch('src/assets/styles/**.scss', style)
  watch('src/assets/scripts/*.js', script)
  watch('src/*.html', page)
  // watch('src/assets/images/**', image)
  // watch('src/assets/fonts/**', font)
  // watch('public/**', extra)
  watch(['src/assets/images/**', 'src/assets/fonts/**', 'public/**'], bs.reload)

  bs.init({
    notify: false,
    port: 2080,
    open: false,
    files: 'dist/**',
    server: {
      // baseDir: 'dist',
      baseDir: ['temp', 'src', 'public'],
      routes: {
        '/node_modules': 'node_modules',
      },
    },
  })
}

const useref = () => {
  return (
    src('temp/*.html', { base: 'temp' })
      .pipe(plugins.useref({ searchPath: ['temp', '.'] }))
      // html js css 这三种类型的文件
      .pipe(plugins.if(/\.js$/, plugins.uglify()))
      .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
      .pipe(
        plugins.if(
          /\.html$/,
          plugins.htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            miniFyJS: true,
          })
        )
      )
      .pipe(dest('dist'))
  )
}

// const compile = parallel([style, script, page, image, font])
const compile = parallel([style, script, page])

// build 上线之前执行的任务
const build = series(
  clean,
  parallel([series(compile, useref), extra, image, font])
)
const develop = series(compile, serve)

module.exports = {
  compile,
  build,
  develop,
}

// const { src, dest, parallel, series, watch } = require('gulp')

// const del = require('del')
// const browserSync = require('browser-sync')

// const loadPlugins = require('gulp-load-plugins')

// const plugins = loadPlugins()
// const bs = browserSync.create()

// const data = {
//   menus: [
//     {
//       name: 'Home',
//       icon: 'aperture',
//       link: 'index.html'
//     },
//     {
//       name: 'Features',
//       link: 'features.html'
//     },
//     {
//       name: 'About',
//       link: 'about.html'
//     },
//     {
//       name: 'Contact',
//       link: '#',
//       children: [
//         {
//           name: 'Twitter',
//           link: 'https://twitter.com/w_harl'
//         },
//         {
//           name: 'About',
//           link: 'https://weibo.com/harlme'
//         },
//         {
//           name: 'divider'
//         },
//         {
//           name: 'About',
//           link: 'https://github.com/harl'
//         }
//       ]
//     }
//   ],
//   pkg: require('./package.json'),
//   date: new Date()
// }

// const clean = () => {
//   return del(['dist', 'temp'])
// }

// const style = () => {
//   return src('src/assets/styles/*.scss', { base: 'src' })
//     .pipe(plugins.sass({ outputStyle: 'expanded' }))
//     .pipe(dest('temp'))
//     .pipe(bs.reload({ stream: true }))
// }

// const script = () => {
//   return src('src/assets/scripts/*.js', { base: 'src' })
//     .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
//     .pipe(dest('temp'))
//     .pipe(bs.reload({ stream: true }))
// }

// const page = () => {
//   return src('src/*.html', { base: 'src' })
//     .pipe(plugins.swig({ data, defaults: { cache: false } })) // 防止模板缓存导致页面不能及时更新
//     .pipe(dest('temp'))
//     .pipe(bs.reload({ stream: true }))
// }

// const image = () => {
//   return src('src/assets/images/**', { base: 'src' })
//     .pipe(plugins.imagemin())
//     .pipe(dest('dist'))
// }

// const font = () => {
//   return src('src/assets/fonts/**', { base: 'src' })
//     .pipe(plugins.imagemin())
//     .pipe(dest('dist'))
// }

// const extra = () => {
//   return src('public/**', { base: 'public' })
//     .pipe(dest('dist'))
// }

// const serve = () => {
//   watch('src/assets/styles/*.scss', style)
//   watch('src/assets/scripts/*.js', script)
//   watch('src/*.html', page)
//   // watch('src/assets/images/**', image)
//   // watch('src/assets/fonts/**', font)
//   // watch('public/**', extra)
//   watch([
//     'src/assets/images/**',
//     'src/assets/fonts/**',
//     'public/**'
//   ], bs.reload)

//   bs.init({
//     notify: false,
//     port: 2080,
//     // open: false,
//     // files: 'dist/**',
//     server: {
//       baseDir: ['temp', 'src', 'public'],
//       routes: {
//         '/node_modules': 'node_modules'
//       }
//     }
//   })
// }

// const useref = () => {
//   return src('temp/*.html', { base: 'temp' })
//     .pipe(plugins.useref({ searchPath: ['temp', '.'] }))
//     // html js css
//     .pipe(plugins.if(/\.js$/, plugins.uglify()))
//     .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
//     .pipe(plugins.if(/\.html$/, plugins.htmlmin({
//       collapseWhitespace: true,
//       minifyCSS: true,
//       minifyJS: true
//     })))
//     .pipe(dest('dist'))
// }

// const compile = parallel(style, script, page)

// // 上线之前执行的任务
// const build =  series(
//   clean,
//   parallel(
//     series(compile, useref),
//     image,
//     font,
//     extra
//   )
// )

// const develop = series(compile, serve)

// module.exports = {
//   clean,
//   build,
//   develop
// }
