module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      norm: {
        src: ['src/misc.js', 'src/sharepoint.js', 'src/*.js'],
        dest: 'build/admin3.js'
      }
    },
    watch: {
      files: ['src/*.js'],
      tasks: ['w'],
      options: {
        reload: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['w', 'watch']);
  grunt.registerTask('w', ['concat']);
};