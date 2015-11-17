module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      norm: {
        src: ['src/misc.js', 'src/sharepoint.js', 'src/*.js'],
        dest: 'build/ims.js'
      },
      admin: {
        src: ['src/admin/init.js', 'src/admin/*.js', 'src/admin/master.js'],
        dest: 'build/admin.js'
      }
    },
    watch: {
      files: ['src/*.js', 'src/admin/*.js'],
      tasks: ['w'],
      options: {
        reload: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['w', 'watch']);
  grunt.registerTask('w', ['concat:norm', 'concat:admin']);
};