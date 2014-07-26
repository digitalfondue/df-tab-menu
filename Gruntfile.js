module.exports = function(grunt) {
 
  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    datetime: Date.now(),
 
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= pkg.description %> - ' +
        'built <%= grunt.template.today("yyyy-mm-dd") %> - License <%= pkg.license %> (http://www.opensource.org/licenses/<%= pkg.license %>) */\n',
        mangle: {toplevel: true},
        squeeze: {dead_code: false},
        codegen: {quote_keys: true}
      },
      'myproject': {
        src: 'src/df-tab-menu.js',
        dest: 'build/df-tab-menu.min.js'
      }
    }
  });
 
  grunt.loadNpmTasks('grunt-contrib-uglify');
 
  // Default task.
  grunt.registerTask('default', ['uglify:myproject']);
};