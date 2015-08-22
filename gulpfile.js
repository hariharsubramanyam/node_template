const gulp = require('gulp');
const eslint = require('gulp-eslint');
const babelServer = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const nodemon = require('gulp-nodemon');
const mocha = require('gulp-mocha');

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

gulp.task('cleanServerTests', function cleanServerTask(cb) {
  del([
    'serverTestsDist/**/**',
    'serverTestsDist/**',
  ], cb);
});

gulp.task('lintServerTests', ['cleanServerTests'], function lintTask() {
  return gulp.src(['./serverTests/**/*.js', '!./node_modules/**'])
                   .pipe(eslint())
                   .pipe(eslint.format())
                   .pipe(eslint.failOnError());
});

gulp.task('babelServerTests', ['cleanServerTests'], function babelServerTask() {
  return gulp.src(['./serverTests/**/*.js', '!./node_modules/**'])
                   .pipe(sourcemaps.init())
                   .pipe(babelServer())
                   .pipe(sourcemaps.write('.', {'sourceRoot': './serverTests'}))
                   .pipe(gulp.dest('serverTestsDist'));
});


gulp.task('serve', ['buildServer'], function serveTask() {
  nodemon({
    'script': './bin/www',
    'env': {'IS_TEST': false},
    'tasks': 'buildServer',
    'ignore': ['serverTests/*', 'serverTestsDist/*'],
  });
});

gulp.task('serveTestDb', ['buildServer'], function serveTask() {
  nodemon({
    'script': './bin/www',
    'env': {'IS_TEST': true},
    'tasks': 'buildServer',
    'ignore': ['serverTests/*', 'serverTestsDist/*'],
  });
});

gulp.task('testServer', ['buildServerTests'], function testServer() {
  return gulp.src(['./serverTestsDist/*.js']).pipe(mocha());
});

gulp.task('buildServer', ['cleanServer', 'lintServer', 'handlebarsServer', 'babelServer']);
gulp.task('buildServerTests', ['cleanServerTests', 'lintServerTests', 'babelServerTests']);
gulp.task('default', ['buildServer', 'serve']);
