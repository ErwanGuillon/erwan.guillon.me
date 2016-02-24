var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    include = require('gulp-include'),
    cssnano = require('gulp-cssnano'),
    groupCssMediaQueries = require('gulp-group-css-media-queries'),
    svgSprite = require('gulp-svg-sprite'),
    svg2png = require('gulp-svg2png'),
    rename = require('gulp-rename'),
    imageOptim = require('gulp-imageoptim'),
    del = require('del'),
    package = require('./package.json');

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

gulp.task('css', function () {
  return gulp.src('src/scss/style.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer('last 4 version'))
  .pipe(groupCssMediaQueries())
  .pipe(gulp.dest('dist/assets/'))
  .pipe(cssnano())
  .pipe(rename({ suffix: '.min' }))
  .pipe(gulp.dest('dist/assets/'))
  .pipe(browserSync.reload({stream:true}));
});

gulp.task('jshint', function(){
  gulp.src('src/js/script.js')
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('default'));
});

gulp.task('js',function(){
  gulp.src('src/js/script.js')
  .pipe( include() )
  .pipe(uglify())
  .on('error', handleError)
  .pipe(rename({ suffix: '.min' }))
  .pipe(gulp.dest('dist/assets/js'))
  .pipe(browserSync.reload({stream:true, once: true}));
});

gulp.task('images', function() {
  return gulp.src('src/img/**/*')
  .pipe(imageOptim.optimize())
  .pipe(gulp.dest('dist/assets/img'));
});

gulp.task('svgSprite', function(){
  return gulp.src('src/svg/*.svg')
  .pipe(svgSprite({ mode: {symbol: {dest: '',sprite: 'sprite.svg'}} }))
  .on('error', handleError)
  .pipe(gulp.dest('dist/assets/img/svg'));
});

gulp.task('svg2png', ['svgSprite'], function(){
  return gulp.src('src/svg/*.svg')
  .pipe(svg2png())
  .on('error', handleError)
  .pipe(gulp.dest('dist/assets/img/svg'));
});

gulp.task('renamePng', ['svg2png'], function(){
  return gulp.src(['dist/assets/img/svg/*.png', '!assets/img/svg/sprite.svg.*'])
  .pipe(rename({ prefix: 'sprite.svg.', dirname: '' }))
  .pipe(gulp.dest('dist/assets/img/svg'));
});

gulp.task('clean:png', ['renamePng'], function () {
  return del(['dist/assets/img/svg/*.png', '!dist/assets/img/svg/sprite.svg.*']);
});

gulp.task('sprite', ['clean:png']);

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./dist/"
    }
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('default', ['css', 'js', 'jshint', 'browser-sync'], function () {
  gulp.watch("src/scss/**/*.scss", ['css']);
  gulp.watch("src/js/**/*.js", ['js', 'jshint']);
  gulp.watch("**/*.html", ['bs-reload']);
  gulp.watch("dist/assets/img/*.*", ['bs-reload']);
});