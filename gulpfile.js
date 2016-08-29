var gulp = require('gulp');
var config = require('./gulp.config')();
var $ = require('gulp-load-plugins')({lazy: true});

/*
 * List the available gulp tasks
 */
gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

/*
 * Vet the code
 */
gulp.task('vet', function() {
    log('Analyzing source with JSHint and JSCS');
    
    return gulp
        .src(config.alljs)
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.jscs());
});

/*
 * Compile sass to css
 */
gulp.task('styles', function() {
    log('Compiling Sass -> CSS');

    return gulp
        .src(config.sass)
        .pipe($.plumber())
        .pipe($.sass())
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
        .pipe(gulp.dest(config.css));
});

/*
 * Watch files to compile
 */
gulp.task('watch', function() {
    gulp.watch([config.sass], ['styles']);
});

/*
 * Wire-up the bower dependencies
 */
gulp.task('wiredep', function() {
    log('Wiring the bower dependencies into the html');

    var wiredep = require('wiredep').stream;
    var options = config.getWiredepDefaultOptions();

    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe(gulp.dest(config.client));
});

/*
 * Inject files to index
 */
gulp.task('inject', ['wiredep', 'styles'], function() {
    log('Wiring js and css into the html, after files are ready');
    log('this is the destination: ' + config.client);
    return gulp
        .src(config.index)
        .pipe(inject(config.js/*,'', config.jsOrder*/))
        .pipe(inject(config.css))
        .pipe(gulp.dest(config.client));
});

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////

/*
 * Log messages using chalk's blue color.
 */
function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}

/*
 * Inject files in a sorted sequence at a specified inject label
 * @param   {Array} src   glob pattern for source files
 * @param   {String} label   The label name
 * @param   {Array} order   glob pattern for sort order of the files
 * @returns {Stream}   The stream
 */
function inject(src, label, order) {
    var options = {read: false};
    if (label) {
        options.name = 'inject:' + label;
    }
    
    return $.inject(orderSrc(src, order, options));
}

/*
 * Order a stream
 * @param   {Stream} src   The gulp.src stream
 * @param   {Array} order Glob array pattern
 * @returns {Stream} The ordered stream
 */
function orderSrc (src, order, options) {
    //order = order || ['**/*'];
    return gulp
        .src(src, options)
        .pipe($.if(order, $.order(order)));
}