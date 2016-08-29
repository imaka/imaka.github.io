module.exports = function() {
    var bower = {
        json: require('./bower.json'),
        directory: './bower_components/',
        //exclude: ,
        ignorePath: '../..'
    };
    var client = './';
    var src = './src/';
    var temp = './.tmp/';
    
    var config = {
        // all javascript that we want to vet
        alljs: [
            './*.js',
            src + '**/*.js'
        ],    
        bower: bower,
        client: client,
        css: client + 'styles/styles.css',
        index: client + 'index.html',
        js: src + '**/*.js',
        // use on ng projects when injecting 
        // jsOrder: '',
        sass: src + 'styles/**/*.scss',
        temp: temp
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