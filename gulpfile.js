const { dest, parallel, series, src, watch } = require("gulp");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const PluginError = require("plugin-error");
const through = require("through2");

const buildWXSS = () =>
  src("app/**/*.scss")
    .pipe(
      sass({
        outputStyle: "expanded",
        // hack for remaining '@import'
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

        const content = file.contents
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

const watchCommand = parallel(watchWXSS);
const build = parallel(buildWXSS);

exports.watch = watchCommand;
exports.build = build;
exports.default = build;
