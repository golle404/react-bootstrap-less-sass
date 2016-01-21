"use strict";

var path = require("path")
var gulp = require("gulp");
var connect = require("gulp-connect"); //server
var open = require("gulp-open"); //url in browser
var browserify = require("browserify");
var reactify = require("reactify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var less = require("gulp-less");
var sass = require("gulp-sass");
var minify = require("gulp-cssnano");
var uglify = require("gulp-uglify");
var concat = require("gulp-concat");
var lint = require("gulp-eslint");


var config = {
	port: 8088,
	devBaseUrl: "http://localhost",
	paths:{
		html: "./source/*.html",
		js: "./source/js/**/*.js",
		css: {
			src: "./source/css/**/*.css",
			watch: "./source/css/**/*.css",
			dest: "./live/css"
		},
		less: {
			src: "./source/less/main.less",
			watch: "./source/less/**/*.less",
			dest: "./source/css/less"
		},
		sass: {
			src: "./source/sass/main.sass",
			watch: "./source/sass/**/*.sass",
			dest: "./source/css/sass"
		},
		scss: {
			src: "./source/scss/main.scss",
			watch: "./source/scss/**/*.scss",
			dest: "./source/css/scss"
		},
		build: {
			html: "./live/**/*.html",
			js: "./live/js/bundle.js",
			css: "./live/css/main.css",
			dest: "./build"
		},
		live: "./live",
		mainJs: "./source/js/app.js"
	}
};

//dev server
gulp.task("connect", function(){
	connect.server({
		root: ["live"],
		port: config.port,
		base: config.devBaseUrl,
		livereload: true
	})
});
//open browser
gulp.task("open", ["connect"], function(){
	gulp.src("live/index.html")
		.pipe(open({uri: config.devBaseUrl + ":" + config.port + "/"}))
});

//html
gulp.task("html", function(){
	gulp.src(config.paths.html)
		.pipe(gulp.dest(config.paths.live))
		.pipe(connect.reload());
});

//js
gulp.task("js", function(){
	browserify(config.paths.mainJs)
		.transform(reactify)
		.bundle()
		.on("error", console.error.bind(console))
		.pipe(source("bundle.js"))
		.pipe(buffer())
		.pipe(gulp.dest(config.paths.live + "/js"))
		.pipe(connect.reload());
});

//css
gulp.task("css", function(){
	gulp.src(config.paths.css.src)
		.pipe(concat("main.css"))
		.pipe(gulp.dest(config.paths.css.dest))
		.pipe(connect.reload());
})

//less
gulp.task("less", function(){
	gulp.src(config.paths.less.src)
		.pipe(less())
		.pipe(gulp.dest(config.paths.less.dest))
})

//sass
gulp.task("sass", function(){
	gulp.src(config.paths.sass.src)
		.pipe(sass())
		.pipe(gulp.dest(config.paths.sass.dest))
})

//scss
gulp.task("scss", function(){
	gulp.src(config.paths.scss.src)
		.pipe(sass())
		.pipe(gulp.dest(config.paths.scss.dest))
})

//styles
gulp.task("styles", ["less", "sass", "scss", "css"]);

//lint
gulp.task("lint", function(){
	return gulp.src(config.paths.js)
		.pipe(lint("eslint.config.json"))
		.pipe(lint.format());
});

//watch
gulp.task("watch", function(){
	gulp.watch(config.paths.html, ["html"]);
	gulp.watch(config.paths.js, ["js", "lint"]);
	gulp.watch(config.paths.css.watch, ["css"]);
	gulp.watch(config.paths.less.watch, ["less", "css"]);
	gulp.watch(config.paths.sass.watch, ["sass", "css"]);
	gulp.watch(config.paths.scss.watch, ["scss", "css"]);
});

//build-html
gulp.task("html-build", ["html"], function(){
	gulp.src(config.paths.build.html)
		.pipe(gulp.dest(config.paths.build.dest));
});

//build-js
gulp.task("js-build", ["js"], function(){
	gulp.src(config.paths.build.js)
		.pipe(uglify())
		.pipe(gulp.dest(config.paths.build.dest + "/js"));
});

//build-styles
gulp.task("styles-build", ["styles"], function(){
	gulp.src(config.paths.build.css)
		.pipe(minify())
		.pipe(gulp.dest(config.paths.build.dest + "/css"));
});

//build
gulp.task("build",["html-build", "js-build", "styles-build"]);

//default
gulp.task("default", ["html", "js", "styles", "lint", "open", "watch"]);


//bootstrap-less
gulp.task("bootstrap-less", function(){
	gulp.src("node_modules/bootstrap/less/**/*.less")
		.pipe(gulp.dest("source/less/bootstrap"));
})
