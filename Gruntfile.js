module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      norm: {
        src: ['src/Admin/mis.js', 'src/Admin/*.js'],
        dest: 'build/admin3.js'
      },
      assert: {
        src: ['src/AdminAssert/test.js', 'src/AdminAssert/ims.js', 'src/AdminAssert/*.js'],
        dest: 'build/admin3Assert.js'
      }
    },
    uglify: {
      norm: {
        files: {
          'build/admin3.min.js': ['build/admin3.js']
        }
      },
      assert: {
        files: {
          'build/admin3Assert.min.js': ['build/admin3Assert.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['concat:norm', 'uglify:norm']);
  grunt.registerTask('assert', ['concat:assert', 'uglify:assert']);
};