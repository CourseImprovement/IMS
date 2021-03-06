/**
 * @name Tile 
 * @description
 * @todo 
 *  + Rename roster to resources
 *  + Link to performance report under resources
 *  - Course vists
 */
function Tile(config) {
  if (!config) throw "Invalid config of tile";
  this.title = config.title;
  this.helpText = config.helpText;
  this.type = config.type;
  this.data = config.data;
  this.hidden = config.hidden;
  this.config = config.config;
}

/**
 * @name Tile.getAll 
 * @description
 */
Tile.getAll = function(role) {
  var name = role.getRoleName().toLowerCase();
  if (name == 'aim' || name == 'im') {
    return [
      [
        new Tile({
          title: 'Tasks To Review',
          helpText: 'This tile displays tasks that ' + getPronoun('your', role, "'s") + ' ' + role._nextLower(name).toUpperCase() + 's have completed and that as an ' + name.toUpperCase() + ' ' + getPronoun('you', role) + ' need to review.',
          type: 'task-list',
          data: role.getTasksToReview(false),
          hidden: ''
        }),
        new Tile({
          title: 'Completed ' + name.toUpperCase() + ' Tasks',
          helpText: 'This tile displays ' + name.toUpperCase() + ' tasks that ' + getPronoun('you', role) + ' have completed.',
          type: 'survey-list',
          data: role.getCompletedTasks(),
          hidden: ''
        }),
        new Tile({
          title: 'Instructor Standards',
          helpText: 'This tile displays the average score for each instructor standard. Click on a standard\'s line in the graph to view individual instructor scores for that standard',
          type: 'graph',
          data: role.getInstructorStandards(),
          hidden: '',
          config: 'TGLInstructorStandards'
        })
      ],
      [
        new Tile({
          title: 'Incomplete ' + role._nextLower(name).toUpperCase() + ' Tasks',
          helpText: 'This tile displays overdue tasks for ' + role._nextLower(name).toUpperCase() + 's in ' + getPronoun('your', role, "'s") + ' area.',
          type: 'review-list',
          data: role.getIncompleteTasks(),
          hidden: ''
        }),
        new Tile({
          title: 'Resources',
          //helpText: '<h2>Performance Report</h2>A performance report should be filled out if you have noticed an instructor falling below instructor standards for more than one or two weeks and have already re-emphasized standards and expectations with the instructor through performance discussions.  You should not have more than two performance discussions with an instructor without simultaneously submitting a performance report (PR).  Follow Online Instruction’s three-tiered approach for communicating with the instructor about PRs.<br><h2>',
          helpText: 'This tile provides access to submit and view performance reports.  It also displays ' + tmpPretty(role._nextLower(name).toUpperCase()) + 's in ' + getPronoun('your', role, "'s") + ' group.',
          type: 'roster',
          data: role.getRoster(),
          hidden: ''
        }),
        new Tile({
          title: 'Evaluations',
          helpText: 'This tile displays evaluations others have completed about ' + getPronoun('you', role) + ' as an ' + (name.toLowerCase() == 'aim' ? 'Assistant Instructor Manager' : 'Instructor Manager') + '.',
          type: 'survey-list',
          data: role.getEvaluations(),
          hidden: ''
        })
      ],
      [
        new Tile({
          title: 'Average Instructor Hours by Group',
          helpText: 'This tile displays the average instructor weekly hours/credit for each teaching group.',
          type: 'graph',
          data: role.getAvgInstructorHoursByGroup(),
          hidden: '',
          config: 'AIMInstructorHours'
        })
      ]
    ]
  } else if (name == 'tgl' || name == 'atgl') {
    return [
      [
        new Tile({
          title: 'Completed TGL Tasks',
          helpText: 'This tile displays TGL tasks that ' + getPronoun('you', role) + ' have completed.',
          type: 'survey-list',
          data: role.getCompletedTasks(),
          hidden: ''
        }),
        new Tile({
          title: 'Incomplete Instructor Tasks',
          helpText: 'This tile displays overdue tasks for TGLs in ' + getPronoun('your', role, "'s") + ' area.',
          type: 'review-list',
          data: role.getIncompleteTasks(),
          hidden: ''
        }),
        new Tile({
          title: 'Evaluations',
          helpText: 'This tile displays evaluations on ' + getPronoun('you', role) + ' as a ' + name.toUpperCase() + '.',
          type: 'survey-list',
          data: role.getEvaluations(),
          hidden: ''
        }),
        new Tile({
          title: 'Resources',
          helpText: 'This tile provides access to submit and view performance reports.  It also displays ' + tmpPretty(role._nextLower(name).toUpperCase()) + 's in ' + getPronoun('your', role, "'s") + ' group.',
          type: 'roster',
          data: role.getRoster(),
          hidden: ''
        })
      ],
      [
        new Tile({
          title: 'Tasks To Review',
          helpText: 'This tile displays tasks that ' + getPronoun('your', role, "'s") + ' TGLs have completed and that as an AIM ' + getPronoun('you', role) + ' need to review.',
          type: 'task-list',
          data: role.getTasksToReview(true),
          hidden: ''
        })
      ],
      [
        new Tile({
          title: 'Instructor Standards',
          helpText: 'This tile displays the average score for each instructor standard. Click on a standard\'s line in the graph to view individual instructor scores for that standard',
          type: 'graph',
          data: role.getInstructorStandards(),
          hidden: '',
          config: 'TGLInstructorStandards'
        }),
        new Tile({
          title: 'Instructor Hours',
          helpText: 'This tile displays the average instructor hours/credit for each instructor.',
          type: 'graph',
          data: role.getInstructorHours(),
          hidden: '',
          config: 'TGLInstructorHours'
        })
      ]
    ]
  } else if (name == 'instructor') {
    return [
      [
        role._user.showCourseMenu() ?
        new Tile({
          title: 'Completed Instructor Tasks',
          helpText: 'These are the tasks that ' + getPronoun('you', role) + ' completed. The link opens the results.',
          type: 'course-survey-list',
          data: role.getCompletedTasksByCourse(),
          hidden: ''
        }) :

        new Tile({
          title: 'Completed Instructor Tasks',
          helpText: 'These are the tasks that ' + getPronoun('you', role) + ' completed. The link opens the results.',
          type: 'survey-list',
          data: role.getCompletedTasks(),
          hidden: ''
        }),
        new Tile({
          title: 'Hours Spent',
          helpText: 'The total number of hours recorded over the weeks',
          type: 'graph',
          data: role.getSingleInstructorHours(),
          hidden: '',
          config: 'InstructorInstructorHours'
        }),
        new Tile({
          title: 'Inspire a Love for Learning',
          helpText: 'The self reported performance for one of the five instructor standards.',
          type: 'graph',
          data: role.getSingleInstructorStandard('Inspire a Love'),
          hidden: '',
          config: 'InstructorInstructorStandard1'
        })
      ],
      [
        new Tile({
          title: 'SMART Goals',
          helpText: 'The SMART goals set by ' + getPronoun('the instructor', role) + ' during the Week 2 Weekly Reflection.',
          type: 'smart',
          data: role._user.getSmartGoals(),
          hidden: ''
        }),
        new Tile({
          title: 'Building Faith in Jesus Christ',
          helpText: 'The self reported performance for one of the five instructor standards.',
          type: 'graph',
          data: role.getSingleInstructorStandard('Building Faith'),
          hidden: '',
          config: 'InstructorInstructorStandard2'
        }),
        new Tile({
          title: 'Seek Development Opportunities',
          helpText: 'The self reported performance for one of the five instructor standards.',
          type: 'graph',
          data: role.getSingleInstructorStandard('Seek Development'),
          hidden: '',
          config: 'InstructorInstructorStandard3'
        })
      ],
      [
        new Tile({
          title: 'Develop Relationships with and Among Students',
          helpText: 'The self reported performance for one of the five instructor standards.',
          type: 'graph',
          data: role.getSingleInstructorStandard('Develop Relationships'),
          hidden: '',
          config: 'InstructorInstructorStandard4'
        }),
        new Tile({
          title: 'Embrace University Citizenship',
          helpText: 'The self reported performance for one of the five instructor standards.',
          type: 'graph',
          data: role.getSingleInstructorStandard('Embrace University'),
          hidden: '',
          config: 'InstructorInstructorStandard5'
        }),
        new Tile({
          title: 'Evaluations',
          helpText: 'This tile displays evaluations on ' + getPronoun('you', role) + ' as an Instructor.',
          type: 'survey-list',
          data: role.getEvaluations(),
          hidden: ''
        })
      ]
    ];
  }
}

function getPronoun(text, role, opChar){
  if (role.getRoleName().toUpperCase() == ims.aes.value.i.toUpperCase() && role._user.getEmail() == ims.aes.value.e){
    return text;
  }
  if (opChar) return role._user.getFirst() + opChar;
  return role._user.getFirst();
}

/**
 * @name Tile.tmpPretty 
 * @description
 */
function tmpPretty(txt){
  if (txt == 'INSTRUCTOR') return 'Instructor';
  return txt;
}