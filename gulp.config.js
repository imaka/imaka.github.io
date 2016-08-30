module.exports = function() {
    var bower = {
        json: require('./bower.json'),
        directory: './bower_components/',
        //exclude: ,
        ignorePath: '../..'
    };
    var build = './';
    var src = './src/';
    var styles = './src/styles/';
    
    var config = {
        // all javascript that we want to vet
        alljs: [
            './*.js',
            src + '**/*.js'
        ],    
        bower: bower,
        build: build,
        css: styles + '**/*.css',
        index: src + 'index.html',
        js: src + '**/*.js',
        // use on ng projects when injecting 
        // jsOrder: '',
        optimized: {
            app: 'app.js',
            lib: 'lib.js'
        },
        sass: styles + '**/*.scss',
        src: src,
        styles: styles
    };
    
    /*
     * wiredep and bower settings
     */
    config.getWiredepDefaultOptions = function() {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            exclude: config.bower.exclude,
            ignorePath: config.bower.ignorePath
        };
        return options;
    };
    
    return config;
};