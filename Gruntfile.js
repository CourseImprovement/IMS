module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      norm: {
        src: ['src/misc.js', 'src/sharepoint.js', 'src/*.js'],
        dest: 'build/ims.js'
      },
      admin: {
        src: ['src/admin/init.js', 'src/admin/master.js', 'src/admin/*.js'],
        dest: 'build/admin.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['concat:norm', 'concat:admin']);
};