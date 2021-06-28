const { dest, parallel, src, watch } = require("gulp");
const rename = require("gulp-rename");
const { sass } = require("@mr-hope/gulp-sass");
const PluginError = require("plugin-error");
const typescript = require("gulp-typescript");
const { Transform } = require("stream");
const fibers = require("fibers");
const sourcemaps = require("gulp-sourcemaps");

const tSProject = typescript.createProject("tsconfig.json");

const buildWXSS = () =>
  src("app/**/*.scss")
    .pipe(
      sass({
        // use `!` as hack for remaining '@import'
        outputStyle: "compressed",
        importer: (url) => {
          console.log(url);
          if (url.includes(".css")) return null;

          return { contents: `@import "${url}.css"` };
        },
        fibers,
      }).on("error", sass.logError)
    )
    .pipe(rename({ extname: ".wxss" }))
    .pipe(
      new Transform({
        objectMode: true,
        transform(chunk, _enc, callback) {
          if (chunk.isNull()) {
            this.push(chunk);

            return callback();
          }

          if (chunk.isStream()) {
            this.emit(
              "error",
              new PluginError("Sass", "Streaming not supported")
            );

            return callback();
          }

          const content = chunk.contents
            .toString()
            .replace(/@import ?"!(.*?)\.css"/gu, '@import "$1.wxss"');

          chunk.contents = Buffer.from(content);

          this.push(chunk);

          callback();
        },
      })
    )
    .pipe(dest("dist"));

const watchWXSS = () =>
  watch("app/**/*.scss", { ignoreInitial: false }, buildWXSS);

const buildTypesciprt = () =>
  src(["app/**/*.ts", "typings/**/*.ts"])
    .pipe(sourcemaps.init())
    .pipe(tSProject())
    .pipe(sourcemaps.write(".", { includeContent: false }))
    .pipe(dest("dist"));

const watchTypescript = () =>
  watch("{app,typings}/**/*.ts", { ignoreInitial: false }, buildTypesciprt);

const moveFiles = () =>
  src("app/**/*.{wxml,wxs,json,svg,png,webp}").pipe(dest("dist"));

const watchFiles = () =>
  watch(
    "app/**/*.{wxml,wxs,json,svg,png,webp}",
    { ignoreInitial: false },
    moveFiles
  );

const watchCommand = parallel(watchWXSS, watchTypescript, watchFiles);
const build = parallel(buildWXSS, buildTypesciprt, moveFiles);

exports.watch = watchCommand;
exports.build = build;

exports.default = build;
