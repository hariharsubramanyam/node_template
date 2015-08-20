const gulp = require('gulp');
const eslint = require('gulp-eslint');
const exec = require('child_process').exec;
const babelServer = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const watch = require('gulp-watch');
const batch = require('gulp-batch');

const myProcess = {
  'child': null,
};

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

gulp.task('watchServer', function watchTask() {
  watch(['./server/**/*.js'], batch(
  function onChange(events, done) {
    if (myProcess.child !== null) {
      myProcess.child.kill();
    }
    gulp.start('serve', done);
  }));
});

gulp.task('serve', ['buildServer'], function serveTask(cb) {
  if (myProcess.child !== null) {
    myProcess.child.kill();
  }
  myProcess.child = exec('DEBUG=urban_safe:* npm start', function onStart() {});
  cb();
});

gulp.task('buildServer', ['cleanServer', 'lintServer', 'handlebarsServer', 'babelServer']);
gulp.task('default', ['buildServer', 'serve', 'watchServer']);
