const gulp = require('gulp');
const eslint = require('gulp-eslint');
const babelServer = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const nodemon = require('gulp-nodemon');

gulp.task('cleanServer', function cleanServerTask(cb) {
  del([
    'serverDist/**/**',
    'serverDist/**',
  ], cb);
});

gulp.task('lintServer', ['cleanServer'], function lintTask() {
  return gulp.src(['./server/**/*.js', '!./node_modules/**'])
                   .pipe(eslint())
                   .pipe(eslint.format())
                   .pipe(eslint.failOnError());
});

gulp.task('babelServer', ['cleanServer'], function babelServerTask() {
  return gulp.src(['./server/**/*.js', '!./node_modules/**'])
                   .pipe(sourcemaps.init())
                   .pipe(babelServer())
                   .pipe(sourcemaps.write('.', {'sourceRoot': './server'}))
                   .pipe(gulp.dest('serverDist'));
});

gulp.task('handlebarsServer', ['cleanServer'], function handlebarsServerTask() {
  return gulp.src(['./server/**/*.hbs', '!./node_modules/**'])
                   .pipe(gulp.dest('serverDist'));
});

gulp.task('serve', ['buildServer'], function serveTask() {
  nodemon({
    'script': './bin/www',
    'tasks': 'buildServer',
  });
});

gulp.task('buildServer', ['cleanServer', 'lintServer', 'handlebarsServer', 'babelServer']);
gulp.task('default', ['buildServer', 'serve']);
