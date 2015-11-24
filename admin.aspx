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
				<option ng-repeat='s in surveys | orderBy:"name"' value='{{s.id}}'>{{s.name}}: week {{s.week}}</option>
			</select>
			<button class="big-btn" ng-click='surveyModifications("delete", selectSurvey)'>Delete</button>
		</div>
		<hr>
		<div class="row">
			Modify a Survey
			<select class="big-btn" ng-model='selectSurvey2'>
				<option ng-repeat='s in surveys | orderBy:"name"' value='{{s.id}}'>{{s.name}}: week {{s.week}}</option>
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
				Survey Name: <input type="text" ng-model='selectedSurvey.getName()' id="surveyName">
			</div>
			<div class="row">
				Week: <input type="text" ng-model='selectedSurvey.getWeekNumber()' id="surveyWeek">
			</div>
			<div class="row">
				Which View: <select name="placement" ng-model='selectedSurvey.placement' id="Placement">
					<option value="Instructor">Instructor</option>
					<option value="TGL">TGL</option>
					<option value="AIM">AIM</option>
				</select>
			</div>
			<div class="row">
				Email Col <input type="text" ng-model='columnNumberToLetter(selectedSurvey.email)' ng-keyup='selectedSurvey.email = columnNumberToLetter(upper($event))' id='eCol'>
			</div>
			<div class="row">
				Type Col <input type="text" ng-model='columnNumberToLetter(selectedSurvey.type)' ng-keyup='selectedSurvey.type = columnNumberToLetter(upper($event))' id='tCol'>
			</div>
			<div class="row">
				Week Col <input type="text" ng-model='columnNumberToLetter(selectedSurvey.week)' ng-keyup='selectedSurvey.week = columnNumberToLetter(upper($event))' id='wCol'>
			</div>
			<div class="row">
				Course Col <input type="text" ng-model='columnNumberToLetter(selectedSurvey.course)' ng-keyup='selectedSurvey.course = columnNumberToLetter(upper($event))' id='cCol'>
			</div>
			<div class="row">
				 <div class="link" ng-click='addBlankQuestion()'>
				 		<i class='fa fa-plus-square'></i> Add Question
				 </div>
				 <div class="add-dialog" ng-if='showDialog'>
				 	<div class="close" ng-click='closeDialog()'>X</div>
			 			<div class="row">
			 				<select ng-model='selectedQuestion.col' ng-if='file != null' id="arow">
			 					<option value="{{$index}}" ng-repeat='d in csv track by $index'>{{d}}</option>
			 				</select>
			 				<input type="text" ng-model='columnNumberToLetter(selectedQuestion.col)' ng-if='file == null' placeholder='Column Letter' id="arow2" ng-keyup='selectedQuestion.col = upper($event)'>
			 			</div>
			 			<div class="row">
			 				<input type="text" ng-model='selectedQuestion.text' placeholder='Question Text'>
			 			</div>
			 			<div class="row">
			 				<input type="text" ng-model='selectedQuestion.replaceWhat' placeholder='Replace ; Replace2'>	
			 			</div>
			 			<div class="row">
			 				<input type="text" ng-model='selectedQuestion.replaceWith' placeholder='With ; With2'>
			 			</div>
			 			<div class="row">
			 				<button ng-click='addQuestion()'>Add</button>
			 			</div>
			 		</div>
			</div>
			<div class="row">
				<ul class="no-bullet">
					<li ng-repeat='q in questions track by $index'>{{q.text}} <div class="link right" ng-click='removeQuestion(q)'>Remove</div>&nbsp;&nbsp;&nbsp;<div class="link right" ng-click='editQuestion(q)'>Edit</div></li>
				</ul>
			</div>
			<div class="row">
				<button ng-click='submitSurvey()' class="submit">Submit</button>
				<button ng-click='changeMode("Register")' class="submit">Back</button>
			</div>
		</div>
	</div>

	<!-- EVALUATION -->
	<div class="container" ng-if='mode == "Evaluation"'>
		<div class="box">
			<div class="row">
				<div class="row">
					Evaluation by: 
					<select ng-model='bRole'>
						<option value="INSTRUCTOR">INSTRUCTOR</option>
						<option value="TGL">TGL</option>
						<option value="AIM">AIM</option>
						<option value="OCR">OCR</option>
					</select>
					for: 
					<select ng-model='fRole'>
						<option value="INSTRUCTOR">INSTRUCTOR</option>
						<option value="TGL">TGL</option>
						<option value="AIM">AIM</option>
						<option value="OCR">OCR</option>
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
	 				<button ng-show="!evalAdded" ng-click='addEvaluation(bRole, fRole, email, columns, questions, logics)'>Add</button>
	 				<button ng-show="evalAdded" ng-click="clearEvaluation()">Clear</button>
	 			</div>
			</div>
			<div class="row">
				<ul class="no-bullet">
					<li ng-show="evalAdded">
						Evaluation by: {{evaluations.eBy}}      for: {{evaluations.eFor}}
						<br>
						Email Column: {{evaluations.emailCol}}
						<ul class="no-bullet">
							<li ng-repeat='e in evaluations.dataSeries'>
								Question Text: {{e.question}}
								<br>
								Data Column: {{e.col}}
								<br>
								Data Logic: {{e.logic}}
							</li>
						</ul>
					</li>
				</ul>
			</div>
			<div class="row">
				<div class="submit" ng-click='chooseFile()'>
					Choose File
				</div>
				<button ng-show="isFile" ng-click='CreateEvaluationCSV()' class="submit">Start</button>
				<button ng-click='clearEvaluation(); changeMode("LeadershipEval")' class="submit">Back</button>
			</div>
		</div>
	</div>

	<!-- PROCESS -->
	<div class="container" ng-if='mode == "Process"' id="process">
		<select class="big-btn" ng-model='selectSurvey'>
			<option ng-repeat='s in surveys | orderBy:"name"' value='{{s.id}}'>{{s.name}}: week {{s.week}}</option>
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
		<button class="big-btn" ng-click='semesterSetup()'>Start</button>
		<button class="big-btn" ng-click='changeMode("home")'>Back</button>

	</div>

	<!-- LEADERSHIP EVALUATION -->
	<div class="container" ng-if='mode == "LeadershipEval"'>
		<button class="big-btn" ng-click='changeMode("Evaluation")'>Configure</button>
		<button class="big-btn" ng-click='changeMode("home")'>Back</button>
	</div>
</body>
</html>