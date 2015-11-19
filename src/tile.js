function Tile(config) {
  if (!config) throw "Invalid config of tile";
  this.title = config.title;
  this.helpText = config.helpText;
  this.type = config.type;
  this.data = config.data;
  this.hidden = config.hidden;
  this.config = config.config;
}

Tile.getAll = function(role) {
  var name = role.getRoleName().toLowerCase();
  if (name == 'aim' || name == 'im') {
    return [
      [
        new Tile({
          title: 'Tasks To Review',
          helpText: 'This tile displays tasks that your ' + role._nextLower(name).toUpperCase() + 's have completed and that as an ' + name.toUpperCase() + ' you need to review.',
          type: 'task-list',
          data: role.getTasksToReview(false),
          hidden: ''
        }),
        new Tile({
          title: 'Completed ' + name.toUpperCase() + ' Tasks',
          helpText: 'This tile displays ' + name.toUpperCase() + ' tasks that you have completed.',
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
          helpText: 'This tile displays overdue tasks for ' + role._nextLower(name).toUpperCase() + 's in your area.',
          type: 'review-list',
          data: role.getIncompleteTasks(),
          hidden: ''
        }),
        new Tile({
          title: 'Roster',
          helpText: 'This tile displays your ' + role._nextLower(name).toUpperCase() + 's.',
          type: 'roster',
          data: role.getRoster(),
          hidden: ''
        }),
        new Tile({
          title: 'Evaluations',
          helpText: 'This tile displays evaluations others have completed about you in your name as an ' + (name.toLowerCase() == 'aim' ? 'Assistant Instructor Manager' : 'Instructor Manager') + '.',
          type: 'survey-list',
          data: [],
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
          helpText: 'This tile displays TGL tasks that you have completed.',
          type: 'survey-list',
          data: role.getCompletedTasks(),
          hidden: ''
        }),
        new Tile({
          title: 'Incomplete Instructor Tasks',
          helpText: 'This tile displays overdue tasks for TGLs in your area.',
          type: 'review-list',
          data: role.getIncompleteTasks(),
          hidden: ''
        }),
        new Tile({
          title: 'Evaluations',
          helpText: 'This tile displays evaluations on you as a ' + name.toUpperCase() + '.',
          type: 'survey-list',
          data: [],
          hidden: ''
        }),
        new Tile({
          title: 'Roster',
          helpText: 'This tile displays your instructors.',
          type: 'roster',
          data: role.getRoster(),
          hidden: ''
        })
      ],
      [
        new Tile({
          title: 'Tasks To Review',
          helpText: 'This tile displays tasks that your TGLs have completed and that as an AIM you need to review.',
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
          helpText: 'These are the tasks that you completed. The link opens the results.',
          type: 'course-survey-list',
          data: role.getCompletedTasksByCourse(),
          hidden: ''
        }) :

        new Tile({
          title: 'Completed Instructor Tasks',
          helpText: 'These are the tasks that you completed. The link opens the results.',
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
          helpText: 'The SMART goals set by the instructor during the Week 2 Weekly Reflection.',
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
        })
      ]
    ];
  }
}