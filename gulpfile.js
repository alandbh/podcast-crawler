const gulp = require("gulp");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const minify = require("gulp-minify");

function defaultTask(cb) {
    gulp.src([
        "src/vendor/runtime.js",
        "src/vendor/slick-css.js",
        "src/vendor/slick.js",
        "src/main.js",
    ])
        .pipe(
            babel({
                presets: ["@babel/env"],
            })
        )
        .pipe(concat("podcast.js"))
        .pipe(minify())
        .pipe(gulp.dest("dist"));
    cb();
}

exports.default = defaultTask;
