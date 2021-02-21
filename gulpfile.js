const { dest, parallel, src, watch } = require("gulp");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const PluginError = require("plugin-error");
const through = require("through2");
const typescript = require("gulp-typescript");

const tsProject = typescript.createProject("tsconfig.json");

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
    .pipe(dest("dist"));

const buildTypesciprt = () =>
  tsProject.src().pipe(tsProject()).pipe(dest("dist"));

const moveFiles = () =>
  src("app/**/*.{wxml,wxs,json,svg,png}").pipe(dest("dist"));

const watchWXSS = () =>
  watch("app/**/*.scss", { ignoreInitial: false }, buildWXSS);

const watchTypescript = () =>
  watch("app/**/*.ts", { ignoreInitial: false }, buildTypesciprt);

const watchFiles = () =>
  watch(
    "app/**/*.{wxml,wxs,json,svg,png}",
    { ignoreInitial: false },
    moveFiles
  );

const watchCommand = parallel(watchWXSS, watchTypescript, watchFiles);
const build = parallel(buildWXSS, buildTypesciprt, moveFiles);

exports.watch = watchCommand;
exports.build = build;
exports.default = build;
