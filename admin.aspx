<!DOCTYPE html>
<html lang="en" ng-app='admin'>
<head>
	<meta charset="UTF-8">
	<title>Admin</title>
	<link rel="stylesheet" type="text/css" href="https://courseimprovement.github.io/IMS/css/admin.css">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min.js"></script>
	<script type="text/javascript" src='https://courseimprovement.github.io/IMS/lib/papaparse.min.js'></script>
	<script type="text/javascript" src='../_layouts/15/SP.RequestExecutor.js'></script>
	<script type="text/javascript" src='https://courseimprovement.github.io/IMS/build/admin.js'></script>
</head>
<body ng-controller='adminCtrl'>
	<div class="loading">
		<div class="bar"></div>
	</div>
	<!-- HOME -->
	<div class="container" ng-if='mode == "home"'>
		<div class="big-btn" ng-click='changeMode("Register")'>
			Register a Survey
		</div>
		<div class="big-btn" ng-click='changeMode("Process")'>
			Process a Survey
		</div>
		<div class="big-btn" ng-click='changeMode("Permissions")'>
			Permissions
		</div>
		<div class="big-btn" ng-click='changeMode("SemesterSetup")'>
			Semester Setup
		</div>
		<div class="big-btn" ng-click='changeMode("LeadershipEval")'>
			Evaluations
		</div>
	</div>

	<!-- REGISTER -->
	<div class="container" ng-if='mode == "Register"'>
		<div class="row">
			Register a Survey
			<div class="big-btn" ng-click='chooseFile()'>
				Choose File
			</div>
			<button class='big-btn' ng-click='surveyModifications("register", "")'>Register</button>
			<button class="big-btn" ng-click='changeMode("home")'>Back</button>
		</div>
		<hr>
		<div class="row">
			Delete a Survey
			<select class="big-btn" ng-model='selectSurvey'>
				<option ng-repeat='s in surveys | orderBy:"name"' value='{{s.id}}'>{{s.name}}</option>
			</select>
			<button class="big-btn" ng-click='surveyModifications("delete", selectSurvey)'>Delete</button>
		</div>
		<hr>
		<div class="row">
			Modify a Survey
			<select class="big-btn" ng-model='selectSurvey2'>
				<option ng-repeat='s in surveys | orderBy:"name"' value='{{s.id}}'>{{s.name}}</option>
			</select>
			<button class="big-btn" ng-click='surveyModifications("modify", selectSurvey2)'>Modify</button>
		</div>
		<hr>
		<div class="row">
			Copy a Survey
			<select class="big-btn" ng-model='selectSurvey3'>
				<option ng-repeat='s in surveys | orderBy:"name"' value='{{s.id}}'>{{s.name}}</option>
			</select>
			<button class="big-btn" ng-click='surveyModifications("copy", selectSurvey3)'>Copy</button>
		</div>
	</div>

	<!-- REGISTER PT2 -->
	<div class="container" ng-if='mode == "RegisterStart"'>
		<div class="box">
			<div class="row">
				Survey Name: <input type="text" ng-model='surveyName' id="surveyName">
			</div>
			<div class="row">
				Week: <input type="text" ng-model='surveyWeek' id="surveyWeek">
			</div>
			<div class="row">
				Which View: <select name="placement" ng-model='Placement' id="Placement">
					<option value="Instructor">Instructor</option>
					<option value="TGL">TGL</option>
					<option value="AIM">AIM</option>
				</select>
			</div>
			<div class="row">
				Email Col <input type="text" ng-model='surveyEmailCol' ng-keyup='surveyEmailCol = upper($event)' id='eCol'>
			</div>
			<div class="row">
				Type Col <input type="text" ng-model='surveyTypeCol' ng-keyup='surveyTypeCol = upper($event)' id='tCol'>
			</div>
			<div class="row">
				Week Col <input type="text" ng-model='surveyWeekCol' ng-keyup='surveyWeekCol = upper($event)' id='wCol'>
			</div>
			<div class="row">
				Course Col <input type="text" ng-model='surveyCourseCol' ng-keyup='surveyCourseCol = upper($event)' id='cCol'>
			</div>
			<div class="row">
				 <div class="link" ng-click='addBlankQuestion()'>
				 		<i class='fa fa-plus-square'></i> Add Question
				 </div>
				 <div class="add-dialog" ng-if='showDialog'>
				 	<div class="close" ng-click='closeDialog()'>X</div>
			 			<div class="row">
			 				<select ng-model='arow' ng-if='file != null' id="arow">
			 					<option value="{{$index}}" ng-repeat='d in csv track by $index'>{{d}}</option>
			 				</select>
			 				<input type="text" ng-model='arow2' ng-if='file == null' placeholder='Column Letter' id="arow2" ng-keyup='arow2 = upper($event)'>
			 			</div>
			 			<div class="row">
			 				<input type="text" ng-model='atext' placeholder='Question Text'>
			 			</div>
			 			<div class="row">
			 				<input type="text" ng-model='awhat' placeholder='Replace ; Replace2'>	
			 			</div>
			 			<div class="row">
			 				<input type="text" ng-model='awith' placeholder='With ; With2'>
			 			</div>
			 			<div class="row">
			 				<button ng-click='addQuestion(arow2, atext, awhat, awith)' ng-if='file == null'>Add</button>
			 				<button ng-click='addQuestion(arow, atext, awhat, awith)' ng-if='file != null'>Add</button>
			 			</div>
			 		</div>
			</div>
			<div class="row">
				<ul class="no-bullet">
					<li ng-repeat='q in questions track by $index'>{{q.text}} <div class="link right" ng-click='removeQuestion(q)'>Remove</div>&nbsp;&nbsp;&nbsp;<div class="link right" ng-click='editQuestion(q)'>Edit</div></li>
				</ul>
			</div>
			<div class="row">
				<button ng-click='submitSurvey(surveyName, surveyWeek, Placement, surveyEmailCol, surveyTypeCol, surveyWeekCol, surveyCourseCol)' class="submit">Submit</button>
				<button ng-click='changeMode("Register")' class="submit">Back</button>
			</div>
		</div>
	</div>

	<!-- EVALUATION -->
	<div class="container" ng-if='mode == "Evaluation"'>
		<div class="box">
			<div class="row">
				<div class="row">
					Evaluation for: 
					<select ng-model='role'>
						<option value="OCR">OCR</option>
						<option value="TGL">TGL</option>
						<option value="AIM">AIM</option>
					</select>
				</div>
 				<div class="row"> 
 					<input type="text" ng-model='email' placeholder='Email Col' id="email" ng-keyup='email = upper($event)'>
 				</div>
 				<div class="row">
 					<input type="text" ng-model='columns' placeholder='Data Columns' id="columns" ng-keyup='columns = upper($event)'>
 				</div>
 				<div class="row">
 					<input type="text" ng-model='questions' placeholder='Question Texts'>
 				</div>
 				<div class="row">
 					<input type="text" ng-model='logics' placeholder='Logic For Each Question'>
 				</div>
			    <div class="row">
	 				<button ng-click='addEvaluation(role, email, columns, questions, logics)'>Add</button>
	 			</div>
			</div>
			<div class="row">
				<ul class="no-bullet">
					<li ng-repeat='e in evaluations track by $index'>
						Evaluation for: {{e.title}}
						<br>
						Email Column: {{e.emailCol}}
						<ul class="no-bullet">
							<li ng-repeat='d in e.dataSeries'>
								Question Text: {{d.question}}
								<br>
								Data Column: {{d.col}}
								<br>
								Data Logic: {{d.logic}}
							</li>
						</ul>
					</li>
				</ul>
			</div>
			<div class="row">
				<div id="surveyData" class="submit" ng-click='chooseFile()'>
					Choose File
				</div>
				<button ng-click='CreateEvaluationCSV()' class="submit" ng-if="file != null">Start</button>
				<button ng-click='changeMode("LeadershipEval")' class="submit">Back</button>
			</div>
		</div>
	</div>

	<!-- PROCESS -->
	<div class="container" ng-if='mode == "Process"' id="process">
		<select class="big-btn" ng-model='selectSurvey'>
			<option ng-repeat='s in surveys | orderBy:"name"' value='{{s.id}}'>{{s.name}}</option>
		</select>
		<div class="big-btn" ng-click='chooseFile()'>
			Choose File
		</div>
		<button class="big-btn" ng-click='processSurvey(selectSurvey)'>Start</button>
		<button class="big-btn" ng-click='changeMode("home")'>Back</button>
	</div>

	<!-- PERMISSIONS -->
	<div class="container" ng-if='mode == "Permissions"'>
		<button class="big-btn" ng-click='permissions()'>Start</button>
		<button class="big-btn" ng-click='checkPermissions()'>Check</button>
		<button class="big-btn" ng-click='changeMode("home")'>Back</button>
	</div>

	<!-- SEMESTER SETUP -->
	<div class="container" ng-if='mode == "SemesterSetup"'>
		<div class="big-btn" ng-click='chooseFile()'>
			Choose File
		</div>
		<button class="big-btn" ng-click='setupStart()'>Start</button>
		<button class="big-btn" ng-click='changeMode("home")'>Back</button>

	</div>

	<!-- LEADERSHIP EVALUATION -->
	<div class="container" ng-if='mode == "LeadershipEval"'>
		<button class="big-btn" ng-click='changeMode("Evaluation")'>Configure</button>
		<button class="big-btn" ng-click='changeMode("home")'>Back</button>
	</div>
</body>
</html>