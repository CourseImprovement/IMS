<!DOCTYPE html>
<html lang="en" ng-app='admin'>
<head>
	<meta charset="UTF-8">
	<title>IMS | Admin</title>
	<link type="image/x-icon" href="https://www.byui.edu/prebuilt/stylenew/images/ico/favicon.ico" rel="shortcut icon">
	<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.8/semantic.min.css">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
	<script type="text/javascript" src='https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.8/semantic.min.js'></script>
	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min.js"></script>
	<script type="text/javascript" src='https://courseimprovement.github.io/IMS/lib/papaparse.min.js'></script>
	<script type="text/javascript" src='../_layouts/15/SP.RequestExecutor.js'></script>
	<script type="text/javascript" src='build/byui.js'></script>
	<script type="text/javascript" src='build/admin.js'></script>
	<style>
		 .pusherz{padding-left: 133px;}
		 .notification{
			 	background-color: #B52626;
		    position: fixed;
		    top: 10px;
		    right: -300px;
		    color: white;
		    padding: 14px 27px;
		    -webkit-box-shadow: 0 0 17px -2px rgba(0,0,0,.8);
		    -moz-box-shadow: 0 0 17px -2px rgba(0,0,0,.8);
		    box-shadow: 0 0 17px -2px rgba(0,0,0,.8);
		    min-width: 138px;
		    max-width: 300px;
		    z-index: 99999;
		 }
		 .loading{
		 		display: none;
		 }
		 li > input{
		    height: 38px;
		    border-radius: 5px;
		    border: 1px solid #000;
		    padding-left: 10px;
		    position: relative;
		    top: -10px;
		 }
		 li > span{
		 	position: relative;
		    top: -10px;
		 }
		 li > select{
		    height: 38px;
		    border-radius: 5px;
		    border: 1px solid #000;
		    padding-left: 10px;
		    position: relative;
    		top: -5px;
		 }
	</style>
</head>
<body ng-controller='adminCtrl'>
	<div class="ui active dimmer loading" style='display:none;'>
		<div class="ui indicating progress active">
		  <div class="bar" style="transition-duration: 300ms; width: 10%;"></div>
		</div>
  </div>
	<div class="ui left demo vertical inverted sidebar labeled icon menu visible">
	  <a class="item" ng-repeat='item in menu' ng-class='item.active ? "active" : ""' ng-click='menuChange(item)'>
	    <i class="icon" ng-class='item.icon'></i>
	    {{item.name}}
	  </a>
	</div>
	
	<div class="pusherz">
		<div class="ui container">
			<br>
			<h2 class="ui center aligned icon header">
			  <i class="circular icon" ng-class='selectedMenuItem.icon'></i>
			  {{selectedMenuItem.name}}
			</h2>

			<div ng-if='view == "instructions"'>
				<div class="ui styled accordion" style="margin: 0 auto;">
				  <div class="title active">
				    <i class="dropdown icon"></i>
				    Process a Survey
				  </div>
				  <div class="content active">
				    <p class="transition visible" style="display: block !important;">
				    	To use <strong>Process a Survey</strong> use the following instructions:
				    	<ol class="ui list">
				    		<li>Use the dropdown and select a course.</li>
				    		<li>Upload the Qualtrics file downloaded from the Qualtrics survey</li>
				    		<li>Click <strong>Start</strong></li>
				    	</ol>
				    </p>
				  </div>
				  <div class="title">
				    <i class="dropdown icon"></i>
				    Permissions
				  </div>
				  <div class="content">
				    <p class="transition visible" style="display: block !important;">
				    	To use <strong>Permissions</strong> use the following instructions:
				    	<ol class="ui list">
				    		<li>Click the button, <strong>Change</strong></li>
				    	</ol>
				    </p>
				  </div>
				  <div class="title">
				    <i class="dropdown icon"></i>
				    Semester Setup
				  </div>
				  <div class="content">
				    <p class="transition visible" style="display: block !important;">
				    	To use <strong>Semester Setup</strong> use the following instructions:
				    	<ol class="ui list">
				    		<li>Click <strong>Choose File</strong>, and upload the OSM Semester Setup report</li>
				    		<li>Click <strong>Start</strong></li>
				    	</ol>
				    </p>
				  </div>
				  <div class="title">
				    <i class="dropdown icon"></i>
				    Qualtrics Prep
				  </div>
				  <div class="content">
				    <p class="transition visible" style="display: block !important;">
				    	To use <strong>Qualtrics Prep</strong> use the following instructions:
				    	<ol class="ui list">
				    		<li>From the dropdown, choose the left most side of the CSV you want exported</li>
				    		<li>From the dropdown, choose the right most side of the CSV you want to be exported</li>
				    		<li>Select <strong>Include Course</strong> if the course is needed to be included</li>
				    		<li>Click <strong>Choose File</strong> and upload the OSM Semester Setup file</li>
				    		<li>Click <strong>Start</strong></li>
				    	</ol>
				    </p>
				  </div>
				  <div class="title">
				    <i class="dropdown icon"></i>
				    Evaluations
				  </div>
				  <div class="content">
				    <p class="transition visible" style="display: block !important;">
				    	To use <strong>Evaluations</strong> use the following instructions:
				    	<ol class="ui list">
				    		<li>
				    			Selecting a known evaluation
				    			<ol>
				    				<li>Select a saved evaluation from the saved evaluation dropdown</li>
				    				<li>Change any information as needed</li>
				    				<li>Click <strong>Choose File</strong> and upload the Qualtrics CSV</li>
				    				<li>Click <strong>Start</strong></li>	
				    			</ol>
				    		</li>
				    		<li>
				    			Creating a new evaluation
				    			<ol>
				    				<li>Select the roles for who will be evaluated</li>
				    				<li>Select the roles for who will be the evaluator</li>
				    				<li><strong>Email Column</strong> refereneces the email column from the uploaded Qualtrics CSV <strong>Use Upper Case</strong></li>
				    				<li>Use the <strong>Evaluation Name</strong> field to give the evaluation a name or to change the existing name</li>
				    				<li>Click <strong>Add Question</strong> to add a new question, repeat as needed</li>
				    				<li>Click the red 'X' to remove a question</li>
				    				<li>Fill in the question text that will appear on the dashboard</li>
				    				<li>Fill in the column letter from the Qualtrics csv in the <strong>Data Column</strong></li>
				    				<li>Click <strong>Save</strong> to save the new evaluation</li>
				    				<li>&nbsp;&nbsp;&nbsp;Click <strong>Choose File</strong> and upload the Qualtrics CSV</li>
				    				<li>&nbsp;&nbsp;&nbsp;Click <strong>Start</strong></li>
				    			</ol>
				    		</li>
				    		<li>
				    			Things to note
				    			<ol>
				    				<li>When a saved evaluation has been selected, modified, and saved. The original evaluation will be overwritten</li>
				    				<li>Click <strong>Remove Evaluation</strong> to competely delete a saved evaluation</li>
				    				<li>The email column should be the subordinates' email column</li>
				    			</ol>
				    		</li>
				    	</ol>
				    </p>
				  </div>
				  <div class="title">
				    <i class="dropdown icon"></i>
				    Add / Modify Survey
				  </div>
				  <div class="content">
				    <p class="transition visible" style="display: block !important;">
				    	To use <strong>Add Survey</strong> use the following instructions:
				    	<h2 class="ui sub header">Survey Instructions</h2>
				    	<ol class="ui list">
				    		<li><strong>Survey Name:</strong> this is the name of the survey. (e.g. Weekly Reflection, GSR, etc.)</li>
				    		<li><strong>Week:</strong> is the week number. (e.g. 1, 2, Intro, Conclusion, etc.)</li>
				    		<li><strong>Is Evaluation:</strong> this determines if the survey is an evaluation.</li>
				    		<li><strong>Which View:</strong> this determines which dashboard view the data appears on</li>
				    		<li><strong>Email Col:</strong> the column in the Qualtrics CSV where the email could be found. <strong>Use Upper Case.</strong></li>
				    		<li><strong>Course Col:</strong> the column in the Qualtrics CSV where the course could be found. <strong>Use Upper Case.</strong></li>
				    	</ol>
				    	<h2 class="ui sub header">Add Question Instructions</h2>
				    	<ol class="ui list">
				    		<li><strong>Column Letter:</strong> the column in the Qualtrics CSV where the question could be found. </li>
				    		<li><strong>Question Text:</strong> how the question should appear on the dashboards. </li>
				    		<li><strong>Replace What:</strong> defines values that need to be changed. <strong>Use a ; to separate multiple values.</strong></li>
				    		<li><strong>Replace With:</strong> defines values that will replace those being changed. <strong>Use a ; to separate multiple values.</strong></li>
				    	</ol>
				    	<h2 class="ui sub header">Modify Question Instructions</h2>
				    	<ol class="ui list">
				    		<li>Click one of the questions and follow the instructions above.</li>
				    	</ol>
				    </p>
				  </div>
				  <div class="title">
				    <i class="dropdown icon"></i>
				    Remove Survey
				  </div>
				  <div class="content">
				    <p class="transition visible" style="display: block !important;">
				    	To use <strong>Remove Survey</strong> use the following instructions:
				    	<ol class="ui list">
				    		<li>From the dropdown, choose the desired survey</li>
				    		<li>Click <strong>Start</strong></li>
				    	</ol>
				    </p>
				  </div>
				  <div class="title">
				    <i class="dropdown icon"></i>
				    Copy Survey
				  </div>
				  <div class="content">
				    <p class="transition visible" style="display: block !important;">
				    	To use <strong>Copy Survey</strong> use the following instructions:
				    	<ol class="ui list">
				    		<li>From the dropdown, choose the desired survey</li>
				    		<li>Click <strong>Start</strong></li>
				    	</ol>
				    </p>
				  </div>
				</div>
			</div>

			<div ng-if='view == "qualtrics prep"' class="ui center aligned header">
				<div class="item">
					<div class="ui selection dropdown" id="left">
					  <input type="hidden" name="left">
					  <i class="dropdown icon"></i>
					  <div class="default text">Left Side</div>
					  <div class="menu">
					    <div class="item" data-value="instructor">Instructor</div>
					    <div class="item" data-value="TGL">TGL</div>
					    <div class="item" data-value="AIM">AIM</div>
					    <div class="item" data-value="IM">IM</div>
					    <div class="item" data-value="OCR">OCR</div>
					  </div>
					</div>
				</div>
				<br>
				<div class="item">
					<div class="ui selection dropdown" id="right">
					  <input type="hidden" name="right">
					  <i class="dropdown icon"></i>
					  <div class="default text">Right Side</div>
					  <div class="menu">
					    <div class="item" data-value="instructor">Instructor</div>
					    <div class="item" data-value="TGL">TGL</div>
					    <div class="item" data-value="AIM">AIM</div>
					    <div class="item" data-value="IM">IM</div>
					    <div class="item" data-value="OCR">OCR</div>
					  </div>
					</div>
				</div>
				<br>
				<div class="item">
					<div class="ui slider checkbox" id="course">
					  <input type="checkbox" name="newsletter">
					  <label>Include Course</label>
					</div>
				</div>
				<br>
				<div class="item">
					<button class="massive ui button blue" ng-click='chooseFile()'>Choose File</button>
					<button class="massive ui button green" ng-click='startQualtricsPrep()' ng-class='isFile ? "" : "disabled"'>Start</button>
				</div>
			</div>

			<div ng-if='view == "evaluations"'>
				<div class="ui grid">
					<div class="two wide column"></div>
					<div class="twelve wide column">
						<div class="ui fluid search selection dropdown" style="border: 1px solid #000;">
						  <input type="hidden" name="evalList" id='evalList' ng-model='evaluation'>
						  <i class="dropdown icon"></i>
						  <div class="default text">Saved Evaluations</div>
						  <div class="menu">
							  <div class="item" data-value="{{evalItem.id}}" ng-repeat="evalItem in savedEvaluations">{{evalItem.name}}</div>
							</div>
						</div>
						<br>
						<div class="ui form">
							<div class="field">
								<label>
									Evaluation Name
								</label>
								<input type="text" style="border: 1px solid #000;" ng-model='evaluation.name' />
							</div>
						</div>
						<br><br>
						<label>
							Evaluation for &nbsp;&nbsp;
						</label>
						<div class="ui selection dropdown" id="for" style="border: 1px solid #000;">
						  <input type="hidden" name="left" ng-model="evaluation.for">
						  <i class="dropdown icon"></i>
						  <div class="default text">Role</div>
						  <div class="menu">
						    <div class="item" data-value="instructor">Instructor</div>
						    <div class="item" data-value="TGL">TGL</div>
						    <div class="item" data-value="AIM">AIM</div>
						    <div class="item" data-value="IM">IM</div>
						    <div class="item" data-value="OCR">OCR</div>
						  </div>
						</div>
						<label>
							&nbsp;&nbsp;by&nbsp;&nbsp;
						</label>
						<div class="ui selection dropdown" id="by" style="border: 1px solid #000;">
						  <input type="hidden" name="right" ng-model="evaluation.by">
						  <i class="dropdown icon"></i>
						  <div class="default text">Role</div>
						  <div class="menu">
						    <div class="item" data-value="instructor">Instructor</div>
						    <div class="item" data-value="TGL">TGL</div>
						    <div class="item" data-value="AIM">AIM</div>
						    <div class="item" data-value="IM">IM</div>
						    <div class="item" data-value="OCR">OCR</div>
						  </div>
						</div>
						<br><br>
						<form class="ui form">
							<div class="two wide column">
								<div class="field">
									<label style="display: inline;position: relative;top: 7px;">
										Email Column&nbsp;&nbsp;
									</label>
									<input type="text" style="width: 196px;border: 1px solid #000;" ng-model='evaluation.emailCol' all-caps />
								</div>
								<div class="field">
									<br/><br/>
									<button class="ui button teal" ng-click='addEvaluation()'>Add Question</button>
									<button class="ui button red" style='float:right;' ng-click='removeEvaluation()'>Remove Evaluation</button>
								</div>
							</div>
						</form>
						<h2>Questions</h2>
						<ol class="ui list">
							<li ng-repeat="question in evaluation.dataSeries" style="padding-bottom: 15px;">
								<span ng-if="$index > 8">&nbsp;&nbsp;&nbsp;</span>
								<span>Question&nbsp;&nbsp;</span>
								<input type="text"
									   placeholder="Question Text" 
									   ng-model="question.text"
									   style="width: 500px"/>
								<i class="large remove icon" 
								   style="color: red;position: relative;top: -23px;left: 10px;"
								   ng-click="removeEvalQuestion($index)">
								</i>
								<ol>
									<li>
										<span ng-if="$index > 8">&nbsp;&nbsp;&nbsp;</span>
										<span>Data Column&nbsp;&nbsp;</span>
										<input type="text"
											   placeholder="Data Column" 
											   ng-model="question.col"
											   style="width: 104px" all-caps />
									</li>
									<li>
										<span ng-if="$index > 8">&nbsp;&nbsp;&nbsp;</span>
										<span>Question Logic&nbsp;&nbsp;</span>
										<select ng-model="question.logic">
											<option value="v">Value</option>
											<option value="cv">Combined Value</option>
											<option value="p">Percentage</option>
											<option value="cp">Column Percentage</option>
											<option value="ccp">Combined Column Percentage</option>
										</select>
									</li>
								</ol>
								<br>
							</li>
						</ol>
						<div class="ui center aligned header">
							<button class="massive ui button orange" ng-click='saveEvaluation()'>Save</button>
							<button class="massive ui button blue" ng-click='chooseFile()'>Choose File</button>
							<button class="massive ui button green" ng-click='startEvaluations()' ng-class='isFile ? "" : "disabled"'>Start</button>
						</div>
					</div>
					<div class="two wide column"></div>
				</div>
			</div>

			<div ng-if='view == "semester setup"'>
				<div class="ui center aligned header">
					<button class="massive ui button blue" ng-click='chooseFile()'>Choose File</button>
					<button class="massive ui button green" ng-click='startSemesterSetup()' ng-class='isFile ? "" : "disabled"'>Start</button>
				</div>
			</div>

			<div ng-if='view == "permissions"'>
				<div class="ui center aligned header">
					<button class="massive ui button green" ng-click='changePermissions()'>Change</button>
				</div>
			</div>

			<div ng-if='view == "add survey"'>
				<div>
					<div class="ui grid">
						<div class="eight wide column">
							<form class="ui form">
								<div class="field">
									<label>Survey Name</label>
									<input type="text" placeholder='Weekly Reflection' ng-model='selectedSurvey.name'>
								</div>
								<div class="field">
									<label>Week</label>
									<input type="text" placeholder='Intro' ng-model='selectedSurvey.week'>
								</div>
								<div class="field">
									<div class="ui checkbox">
									  <input type="checkbox" ng-checked='selectedSurvey.iseval'>
									  <label>Is Evaluation</label>
									</div>
								</div>
								<div class="field">
									<div class="ui selection dropdown" id="whichView">
									  <input type="hidden" name="whichView">
									  <i class="dropdown icon"></i>
									  <div class="default text">Which View</div>
									  <div class="menu">
									    <div class="item" data-value="Instructor">Instructor</div>
									    <div class="item" data-value="TGL">TGL</div>
									    <div class="item" data-value="AIM">AIM</div>
									  </div>
									</div>
								</div>
								<div class="field">
									<label>Email Col</label>
									<input type="text" ng-model='selectedSurvey.email' all-caps>
								</div>
								<div class="field">
									<label>Course Col</label>
									<input type="text" ng-model='selectedSurvey.course' all-caps>
								</div>
							</form>
						</div>
						<div class="eight wide column">
							<button class="ui button blue" ng-click='addQuestion()' ng-class='!selectedSurvey ? "disabled" : ""'>Add Question</button>
							<button class="ui button green" ng-click='submitChanges()' ng-class='!selectedSurvey ? "disabled" : ""'>Save</button>
							<br>
							<h2 class="ui sub header">
								Questions
							</h2>
							<div class="ui link list">
							  <a class="item" ng-repeat='question in selectedSurvey.questions' ng-click='editQuestion(question)'>{{question.text}}</a>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div ng-if='view == "remove survey" || view == "copy survey" || view == "process" || view == "modify survey"'>
				<div class="ui grid">
					<div class="two wide column"></div>
					<div class="twelve wide column">
						<div class="ui fluid search selection dropdown">
						  <input type="hidden" name="selectedSurvey" ng-model='selectedSurvey'>
						  <i class="dropdown icon"></i>
						  <div class="default text">Select Survey</div>
						  <div class="menu">
							  <div class="item" data-value="{{survey.id}}" ng-repeat='survey in surveys | reverseByWeek'>{{survey.name}}: week {{survey.week}}</div>
							</div>
						</div>
					</div>
					<div class="two wide column"></div>
				</div>
				<div ng-if='view != "modify survey"'>
					<br>
					<div class="ui center aligned header">
						<button class="massive ui button red" ng-click='removeSurvey()' ng-if='view == "remove survey"'>Delete Survey</button>
						<button class="massive ui button orange" ng-click='copySurvey()' ng-if='view == "copy survey"'>Copy Survey</button>
						<div ng-if='view == "process"'>
							<button class="massive ui button blue" ng-click='chooseFile()'>Choose File</button>
							<button class="massive ui button green" ng-click='startProcess()' ng-class='isFile ? "" : "disabled"'>Start</button>
						</div>
					</div>
				</div>
				<div ng-if='view == "modify survey"'>
					<br><br>
					<div class="ui grid">
						<div class="eight wide column">
							<form class="ui form">
								<div class="field">
									<label>Survey Name</label>
									<input type="text" placeholder='Weekly Reflection' ng-model='selectedSurvey.name'>
								</div>
								<div class="field">
									<label>Week</label>
									<input type="text" placeholder='Intro' ng-model='selectedSurvey.week'>
								</div>
								<div class="field">
									<div class="ui checkbox">
									  <input type="checkbox" ng-checked='selectedSurvey.iseval'>
									  <label>Is Evaluation</label>
									</div>
								</div>
								<div class="field">
									<div class="ui selection dropdown" id="whichView">
									  <input type="hidden" name="whichView">
									  <i class="dropdown icon"></i>
									  <div class="default text">Which View</div>
									  <div class="menu">
									    <div class="item" data-value="Instructor">Instructor</div>
									    <div class="item" data-value="TGL">TGL</div>
									    <div class="item" data-value="AIM">AIM</div>
									  </div>
									</div>
								</div>
								<div class="field">
									<label>Email Col</label>
									<input type="text" ng-model='selectedSurvey.email'>
								</div>
								<div class="field">
									<label>Course Col</label>
									<input type="text" ng-model='selectedSurvey.course'>
								</div>
							</form>
						</div>
						<div class="eight wide column">
							<button class="ui button blue" ng-click='addQuestion()' ng-class='!selectedSurvey ? "disabled" : ""'>Add Question</button>
							<button class="ui button green" ng-click='submitChanges()' ng-class='!selectedSurvey ? "disabled" : ""'>Save</button>
							<br>
							<h2 class="ui sub header">
								Questions
							</h2>
							<div class="ui link list">
							  <a class="item" ng-repeat='question in selectedSurvey.questions' ng-click='editQuestion(question)'>{{question.text}}</a>
							</div>
						</div>
					</div>
				</div>
			</div>

		</div>

		<div class="ui modal" id="questionModal">
		  <i class="close icon"></i>
		  <div class="header">
		    Add / Modify a Question
		  </div>
		  <div class="content">
		    <form class="ui form">
		    	<div class="field">
		    		<label>Column Letter</label>
		    		<input type="text" ng-model='question.columnLetter' all-caps>
		    	</div>
		    	<div class="field">
		    		<label>Question Text</label>
		    		<input type="text" ng-model='question.questionText'>
		    	</div>
		    	<br>
		    	<div class="field">
		    		<label>Replace Area</label>
		    	</div>
		    	<div class="field inline">
		    		<input type="text" placeholder='Replace What' ng-model='what'>
		    		<input type="text" placeholder='Replace With' ng-model='with'>
		    		<button class="ui button" ng-click='addReplace(what, with)'>Add</button>
		    	</div>
		    	<div class="field">
		    		<table class="ui table">
		    			<tr>
		    				<th>&nbsp;</th>
		    				<th>Replace What</th>
		    				<th>Replace With</th>
		    			</tr>
		    			<tr ng-repeat='r in question.replaces'>
		    				<td><div class="ui mini button" ng-click='removeReplaces(r, $index)'>Remove</div></td>
		    				<td>{{r.what}}</td>
		    				<td>{{r.with}}</td>
		    			</tr>
		    		</table>
		    	</div>
		    </form>
		  </div>
		  <div class="actions">
		  	<div class="ui red deny button" ng-click='removeQuestion(question)'>
		  		Delete
		  	</div>
		    <div class="ui black deny button">
		      Cancel
		    </div>
		    <div class="ui positive right labeled icon button">
		      Add / Modify
		      <i class="checkmark icon"></i>
		    </div>
		  </div>
		</div>
	</div>

	<div class="notification">
	  <span class="title" id='errMsg'></span>
	</div>

</body>
</html>