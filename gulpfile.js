const { dest, parallel, series, src, watch } = require("gulp");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const PluginError = require("plugin-error");
const through = require("through2");

// `clean` 函数并未被导出（export），因此被认为是私有任务（private task）。
// 它仍然可以被用在 `series()` 组合中。
const clean = (cb) => {
  // body omitted
  cb();
};

const buildWXSS = () =>
  src("app/**/*.scss")
    .pipe(
      sass({
        outputStyle: "expanded",
        importer: (url, _prev, done) => {
          if (url.includes(".css")) return null;
          done({ contents: `@import "${url}.css"` });
        },
      }).on("error", sass.logError)
    )
    .pipe(rename({ extname: ".wxss" }))
    .pipe(
      through.obj(function (file, enc, cb) {
        if (file.isNull()) {
          this.push(file);
          return cb();
        }

        if (file.isStream()) {
          this.emit(
            "error",
            new PluginError("Sass", "Streaming not supported")
          );
          return cb();
        }

        var content = file.contents
          .toString()
          .replace(/@import url\((.*?)\.css\)/gu, '@import "$1.wxss"');
        file.contents = Buffer.from(content);

        this.push(file);

        cb();
      })
    )
    .pipe(dest("app/"));

const watchWXSS = () =>
  watch("app/**/*.scss", { ignoreInitial: false }, buildWXSS);

const build = parallel(buildWXSS);

exports.watch = watchWXSS;
exports.build = build;
exports.default = series(clean, build);
