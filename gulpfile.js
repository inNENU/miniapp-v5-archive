const { dest, parallel, src, watch } = require("gulp");
const rename = require("gulp-rename");
const { sass } = require("@mr-hope/gulp-sass");
const typescript = require("gulp-typescript");
const sourcemaps = require("gulp-sourcemaps");

const tSProject = typescript.createProject("tsconfig.json");

const buildWXSS = () =>
  src("app/**/*.scss")
    .pipe(
      sass({
        style: "compressed",
        importers: [
          // preserve `@import` rules
          {
            canonicalize: (url, { fromImport }) =>
              fromImport
                ? new URL(`wx:import?path=${url.replace(/^import:/, "")}`)
                : null,
            load: (canonicalUrl) => ({
              contents: `@import "${canonicalUrl.searchParams.get(
                "path"
              )}.wxss"`,
              syntax: "css",
            }),
          },
        ],
      }).on("error", sass.logError)
    )
    .pipe(rename({ extname: ".wxss" }))
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
