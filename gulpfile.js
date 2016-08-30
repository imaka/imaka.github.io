var gulp = require('gulp');
var config = require('./gulp.config')();
var cleanCSS = require('gulp-clean-css');
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
        .pipe(gulp.dest(config.styles));
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
        .pipe(gulp.dest(config.src));
});

/*
 * Inject files to index
 */
gulp.task('inject', ['wiredep', 'styles'], function() {
    log('Wiring js and css into the html, after files are ready');
    
    return gulp
        .src(config.index)
        .pipe(inject(config.js/*,'', config.jsOrder*/))
        .pipe(inject(config.css))
        .pipe(gulp.dest(config.src));
});

/*
 * Optimize all files, move to a build folder,
 * and inject them into the new index.html
 */
gulp.task('optimize', ['inject'], function() {
    log('Optimizing the js, css, and html');

    var assets = $.useref.assets({searchPath: ['./bower_components','./']});
    // Filters are named for the gulp-useref path
    var cssFilter = $.filter('**/*.css', {restore: true});
    var jsAppFilter = $.filter('**/' + config.optimized.app, {restore: true});
    var jslibFilter = $.filter('**/' + config.optimized.lib, {restore: true});

    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe(assets) // Gather all assets from the html with useref
    // Get the css
        .pipe(cssFilter)
        .pipe(cleanCSS())
        .pipe(cssFilter.restore)
    // Get the custom javascript
        .pipe(jsAppFilter)
        .pipe($.uglify())
        .pipe(getHeader())
        .pipe(jsAppFilter.restore)
    // Get the vendor javascript
        .pipe(jslibFilter)
        .pipe($.uglify()) // another option is to override wiredep to use min files
        .pipe(jslibFilter.restore)
    // Take inventory of the file names for future rev numbers
        .pipe($.rev())
    // Apply the concat and file replacement with useref
        .pipe(assets.restore())
        .pipe($.useref())
    // Replace the file names in the html with rev numbers
        .pipe($.revReplace())
        .pipe(gulp.dest(config.build));
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

/*
 * Format and return the header for files
 */
function getHeader() {
    var pkg = require('./package.json');
    var template = ['/**',
                    ' * <%= pkg.name %> - <%= pkg.description %>',
                    ' * @authors <%= pkg.authors %>',
                    ' * @version v<%= pkg.version %>',
                    ' * @link <%= pkg.homepage %>',
                    ' * @license <%= pkg.license %>',
                    ' */',
                    ''
                   ].join('\n');
    return $.header(template, {
        pkg: pkg
    });
}