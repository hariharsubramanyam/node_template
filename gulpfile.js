const gulp = require('gulp');
const eslint = require('gulp-eslint');
const supervisor = require('gulp-supervisor');
const babelServer = require('gulp-babel');
const del = require('del');

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
                   .pipe(babelServer())
                   .pipe(gulp.dest('serverDist'));
});

gulp.task('handlebarsServer', ['cleanServer'], function handlebarsServerTask() {
  return gulp.src(['./server/**/*.hbs', '!./node_modules/**'])
                   .pipe(gulp.dest('serverDist'));
});

gulp.task('serve', ['cleanServer', 'lintServer', 'handlebarsServer', 'babelServer'], function serveTask() {
  supervisor('./bin/www', {
    watch: ['./bin', './'],
    exec: 'node',
    extensions: ['js'],
    noRestartOn: 'exit',
  });
});
