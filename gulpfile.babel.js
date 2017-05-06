import gulp from 'gulp';
import jasmineNode from 'gulp-jasmine-node';
import gls from 'gulp-live-server';
import babel from 'gulp-babel';
import injectModules from 'gulp-inject-modules';
import gulpBabelIstanbul from 'gulp-babel-istanbul';
import gulpCoveralls from 'gulp-coveralls';
import env from 'gulp-env';
import exit from 'gulp-exit';

require('dotenv').config();

gulp.task('serve', () => {
  env.set({ 'proces.env.NODE_ENV': 'PROD' });
  const server = gls.new('index.js');
  server.start();

  gulp.watch(['routes/*.js', 'src/*.js', 'app.js'], () => {
    server.start.bind(server)();
  });
});

gulp.task('run-tests', () => {
  gulp.src('tests/inverted-index-test.js')
    .pipe(babel())
    .pipe(injectModules())
    .pipe(jasmineNode())
    .pipe(exit());
});
// Gulp coverage implicitly depends on run-tests.
gulp.task('coverage', () => {
  gulp.src(['src/*.js', 'routes/*.js'])
    .pipe(gulpBabelIstanbul())
    .pipe(gulpBabelIstanbul.hookRequire())
    .on('finish', () => {
      gulp.src('tests/inverted-index-test.js')
      .pipe(babel())
      .pipe(injectModules())
      .pipe(jasmineNode())
      .pipe(gulpBabelIstanbul.writeReports())
      .pipe(gulpBabelIstanbul.enforceThresholds({ thresholds: { global: 30 } }))
      .on('end', () => {
        gulp.src('coverage/lcov.info')
        .pipe(gulpCoveralls());
      })
      .pipe(exit());
    });
});
