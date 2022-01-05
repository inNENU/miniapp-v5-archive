const { dest, parallel, src, watch } = require("gulp");
const rename = require("gulp-rename");
const { sassSync } = require("@mr-hope/gulp-sass");
const PluginError = require("plugin-error");
const typescript = require("gulp-typescript");
const { Transform } = require("stream");
const sourcemaps = require("gulp-sourcemaps");

const tSProject = typescript.createProject("tsconfig.json");

const buildWXSS = () =>
  src("app/**/*.scss")
    .pipe(
      sassSync({
        sync: "sync",
        outputStyle: "compressed",
        // use `!` as hack for remaining '@import'
        importer: (url) => {
          if (url.includes(".css")) return null;

          return { contents: `@import "${url}.css"` };
        },
      }).on("error", sassSync.logError)
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

const buildTypeScript = () =>
  src(["app/**/*.ts", "typings/**/*.ts"])
    .pipe(sourcemaps.init())
    .pipe(tSProject())
    .pipe(sourcemaps.write(".", { includeContent: false }))
    .pipe(dest("dist"));

const watchTypeScript = () =>
  watch("{app,typings}/**/*.ts", { ignoreInitial: false }, buildTypeScript);

const moveFiles = () =>
  src("app/**/*.{wxml,wxs,json,svg,png,webp}").pipe(dest("dist"));

const watchFiles = () =>
  watch(
    "app/**/*.{wxml,wxs,json,svg,png,webp}",
    { ignoreInitial: false },
    moveFiles
  );

const watchCommand = parallel(watchWXSS, watchTypeScript, watchFiles);
const build = parallel(buildWXSS, buildTypeScript, moveFiles);

exports.watch = watchCommand;
exports.build = build;

exports.default = build;
