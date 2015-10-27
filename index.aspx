<!DOCTYPE html>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<html lang="en" ng-app='ims' ng-controller='view' ng-click='toggleMenu()' xmlns:mso="urn:schemas-microsoft-com:office:office" xmlns:msdt="uuid:C2F41010-65B3-11d1-A29F-00AA00C14882">
<head>
	<meta charset="UTF-8">
	<link type="image/x-icon" href="//www.byui.edu/prebuilt/stylenew/images/ico/favicon.ico" rel="shortcut icon">
	<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css">
	<link rel="stylesheet" type="text/css" href="css/style.css">
	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min.js"></script>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
	<script type="text/javascript" src='https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/components/aes-min.js'></script>
	<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>
	<script type="text/javascript" src='https://cdnjs.cloudflare.com/ajax/libs/highcharts/4.1.8/highcharts.js'></script>
	<script type="text/javascript" src='https://cdnjs.cloudflare.com/ajax/libs/highcharts/4.1.8/highcharts-more.js'></script>
	<script type="text/javascript" src='https://cdnjs.cloudflare.com/ajax/libs/highcharts/4.1.8/modules/exporting.js'></script>
	<script type="text/javascript" src='build/angular.highcharts.js'></script>
	<script type="text/javascript" src='../_layouts/15/SP.RequestExecutor.js'></script>

	<script type="text/javascript" src='build/ims.js'></script>
	<title>IMS | Dashboard</title>
	
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!--[if gte mso 9]><SharePoint:CTFieldRefs runat=server Prefix="mso:" FieldList="FileLeafRef,_dlc_DocId,_dlc_DocIdUrl,_dlc_DocIdPersistId"><xml>
<mso:CustomDocumentProperties>
<mso:_dlc_DocId msdt:dt="string">SYSTEMS-1372707001-1810</mso:_dlc_DocId>
<mso:_dlc_DocIdItemGuid msdt:dt="string">899d6e89-a697-4634-9472-f70bfd96c5de</mso:_dlc_DocIdItemGuid>
<mso:_dlc_DocIdUrl msdt:dt="string">https://webmailbyui-my.sharepoint.com/personal/willdech_byui_edu/chase/OnlineInstructionReporting/_layouts/15/DocIdRedir.aspx?ID=SYSTEMS-1372707001-1810, SYSTEMS-1372707001-1810</mso:_dlc_DocIdUrl>
</mso:CustomDocumentProperties>
</xml></SharePoint:CTFieldRefs><![endif]-->
</head>
<body>
	<div id="fade" style='display:none'>
		<!-- MENU -->
		<div class="menu">
			<ul>
				<li class="logo left" ng-click='home()'><img src="css/BYUI_logo_white.png" class="byui-logo"></li>
				<li class="page-title left top-tutorial" data-id='name'>{{person.first}} {{person.last}}</li>
				<li class="semester left top-tutorial" ng-click='dropDownSemester($event)' data-id='semesterDropDown' ng-if='view == "INSTRUCTOR"'>{{semester}} <div class='arrow-down2'><i class="fa fa-arrow-down"></i></div></li>
				<li class="right back-btn" ng-if='backButton' ng-click='back()'>Back</li>
				<li class="right search top-tutorial" ng-if='!backButton && view == "AIM"' id="search" ng-click='OpenSearch()' data-id='search'>
					<i class='fa fa-search' ng-if='!searchOpened'></i>
					<input type='text' class="searchInput" ng-if='searchOpened' placeholder='Search...' ng-keydown='searching(q, $event)' ng-model='q'>
				</li>
				<li class="right notification" ng-show='false'><i class='fa fa-bell'></i><div class="notification-sub" ng-if='totalNotifications > 0'>{{totalNotifications}}</div></li>
				<li class="right person-drop-down top-tutorial" ng-click='dropDown($event)' ng-if='selectedMenuItemText.length > 0' data-id='personDropDown' > {{selectedMenuItemText}} <div class='arrow-down2'><i class="fa fa-arrow-down"></i></div></li>
				<li class="right" ng-if='selectedMenuItemText'>View as: </li>
				<li class="course-drop-down right person-drop-down top-tutorial" ng-click='dropDownCourse($event)' ng-if='view == "INSTRUCTOR" && courses.length > 2' data-id='courseDropDown'> {{selectedCourse}} <div class='arrow-down2'><i class="fa fa-arrow-down"></i></div></li>
			</ul>
			<div class="dashboard-title">Instructor Management System</div>
			<ol class="suggestion" ng-if='suggestions.length > 0'>
				<li ng-repeat='s in suggestions' ng-click='suggestionSelected(s)' ng-class='s.selected ? "selected" : ""'>{{s.name}}</li>
			</ol>
		</div>
		<div class="menu-mobile hidden">
			<div class="top-bar">
				<ul>
					<li class="mobile-btn" ng-click='toggleMobileMenu($event)'><i class="fa fa-bars"></i></li>
					<li>Instructor Management System</li>
					<li class="logo" ng-click='home()'><img src="css/BYUI_logo_white.png" class="byui-logo"></li>
				</ul>
			</div>
		</div>
		<!-- MOBILE MENU -->
		<div class="mobile-menu-side">
			<ul>
				<li>{{person.first}} {{person.last}}</li>
				<li ng-click='toggleSubMenu($event)'>{{semester}}
					<ul>
						<li ng-repeat="item in semesters" ng-class="item.selected ? 'selected' : ''" ng-click='selectedSemesterMenuItem(item)'>- {{item}}</li>
					</ul>
				</li>
				<li ng-click='toggleSubMenu($event)'>{{selectedMenuItemText}}
					<ul>
						<li ng-repeat="item in menuItems" ng-class="item.selected ? 'selected' : ''" ng-click='selectedMenuItem(item)'>{{item.name}}</li>
					</ul>
				</li>
			</ul>
		</div>
		<div class="row top"></div>
		<!-- DROP DOWN MENUS -->
		<div>
			<ul class="semester-popup-dropdown" data-id='PersonDropDownOpen' ng-show='showMenu'>
				<li ng-repeat="item in menuItems" ng-class="item.type ? 'menuTitle' : item.selected ? 'selected' : ''" ng-click='item.type ? "" : selectedMenuItem(item)'>{{item.name}}</li>
			</ul>
			<ul class="semester-popup-dropdown2" ng-show='showSemesterMenu'>
				<li ng-repeat="item in semesters" ng-class="item.selected ? 'selected' : ''" ng-click='selectedSemesterMenuItem(item)'>{{item}}</li>
			</ul>
			<ul class="semester-popup-dropdown3" ng-show='showCourseMenu'>
				<li ng-repeat='item in courses' ng-class='item.selected ? "selected" : ""' ng-click='selectCourse(item)'>{{item.name}}</li>
			</ul>
			<!-- <button class="print" onclick="prepPrint()">Print</button> -->
		</div>

		<!-- AIM VIEW -->
		<div ng-if='view == "AIM"'>
			<div class="row sortable-row">
				<div class="col-4" pos='1'>
					<div class="row"></div>
					<div class="row" data-id='AIMtasksToReview'>
						<div class="tile" ng-click='expandTile($event)'>
							<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
							<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-title='This tile displays tasks that your TGLs have completed and that as an AIM you need to review.'><i class='fa fa-question'></i></div>
							<h2 class="title">TGL Tasks To Review</h2>
							<ul class="list selection tasks" data-id='AIMTasksToReviewLink'>
								<li ng-repeat='survey in surveysToReview | reverse | limitTo:TGLLimit'>
									<i class='fa fa-square-o checkbox' ng-click='toggleReviewed(survey)' ng-if='!survey.reviewed'></i>
									<i class='fa fa-check-square-o checkbox' ng-click='toggleReviewed(survey)' ng-if='survey.reviewed'></i> 
									<span ng-if='!survey.reviewed'>{{survey.name}} - <span class='link' ng-click='openSurveyData2(survey)'>{{survey.survey}}</span></span>
									<strike ng-if='survey.reviewed'>{{survey.name}} - <span class='link' ng-click='openSurveyData2(survey)'>{{survey.survey}}</span></strike>
								</li>
								<li ng-if='surveysToReview.length > 2' class='link' ng-click='changelimitTgl()'>{{showAllTextTGL}}</li>
							</ul>
							<div class="hidden selection">
								<div class="definition">These are tasks / surveys that {{person.first}} {{person.last}} still needs to review</div>
							</div>
						</div>
					</div>
					<div class="row" data-id='AIMCompletedTasks'>
						<div class="tile" ng-click='expandTile($event)'>
							<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
							<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-title='This tile displays AIM tasks that you have completed.'><i class='fa fa-question'></i></div>
							<h2 class="title">Completed AIM Tasks</h2>
							<ul class="list selection" ng-if='surveysTaken.length > 0'>
								<li ng-repeat='survey in surveysTaken'>
									<div class='link' ng-click='openSurveyData(survey)'>{{survey.name}}</div>
								</li>
							</ul>
							<div ng-if='surveysTaken.length == 0' class="default-msg">No Completed Tasks</div>
							<div class="hidden selection">
								<div class="definition">These are tasks / surveys that {{person.first}} {{person.last}} has completed</div>
							</div>
						</div>
					</div>
				</div>
				<div class="col-4" pos='2'>
					<div class="row"></div>
					<div class="row" data-id='AIMIncompleteInstructorTasks'>
						<div class="tile" ng-click='expandTile($event)'>
							<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
							<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-title="This tile displays overdue tasks for TGLs in your area."><i class='fa fa-question'></i></div>
							<h2 class="title">Incomplete TGL Tasks</h2>
							<table class="table selection">
								<tr ng-repeat='person in awaitingSurvey | orderBy:"name"'>
									<td><div class="link" ng-click='gotoUrl(person)' ng-if='!person.dontShow'>{{person.name}}</div><span ng-if='person.dontShow'>{{person.name}}</span></td>
									<td>{{person.survey}}</td>
								</tr>
							</table>
							<div class="hidden selection">
								<div class="definition">These are tasks / surveys that members in {{person.first}}'s group still needs to accomplish.</div>
							</div>
						</div>
					</div>
				</div>
				<div class="col-4" pos='3'>
					<div class="row"></div>
					<!-- <div class="row" data-id='AIMMessageWall'>
						<div class="tile">
							<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-position='left' data-title="Messages will not alert {{person.first}} {{person.last}}."><i class='fa fa-question'></i></div>
							<h2 class="title">Message Wall</h2>
							<div class='messages'>
								<div class="message" ng-repeat='message in comm.messages' ng-class='message.align == "right" ? "txt-right" : ""'>
									<div class="talk-bubble tri-right" ng-class='message.align == "right" ? "left-top" : "right-top"'>
										<div class="talktext">
											<p>{{message.text}}</p>
											<span class='msg-stamp'>{{message.from}} - {{message.when}}</span>
										</div>
									</div>
								</div>
							</div>
							<div class="message-input" data-id='AIMMsgInput'>
								<input type='text' class="msg-input" placeholder='Type Message...' ng-keypress='msg = messageInput($event, msg)' ng-model='msg'>
							</div>
						</div>
					</div> -->
					<div class="row" data-id="AIMInstructorHours">
						<div class='tile' ng-click='expandTile($event)'>
							<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
							<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-position='left' data-title='This tile displays the average instructor weekly hours/credit for each teaching group.'><i class='fa fa-question'></i></div>
							<h2 class="title">Average Instructor Hours by Group</h2>
							<div>
								<highchart id="AIMInstructorHours" class='fit' config="AIMInstructorHours"></highchart>
							</div>
							<div class="hidden selection"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- END AIM VIEW -->


		<!-- TGL VIEW -->
		<div ng-if='view == "TGL" || view == "aTGL"' class="sortable-row">
			<div class="row" >
				<div class="col-4" pos='1'>
					<div class="row"></div>
					<div class="row" data-id='TGLCompletedTasks'>
						<div class="tile" ng-click='expandTile($event)'>
							<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
							<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-title='This tile displays TGL tasks that have been completed.'><i class='fa fa-question'></i></div>
							<h2 class="title">Completed TGL Tasks</h2>
							<ul class="list selection" ng-if='surveysTaken.length > 0'>
								<li ng-repeat='survey in surveysTaken | reverse'>
									<div class='link' ng-click='openSurveyData(survey)'>{{survey.name}}</div>
								</li>
							</ul>
							<div ng-if='surveysTaken.length == 0' class="default-msg">No Completed Tasks</div>
							<div class="hidden selection"></div>
						</div>
					</div>
					<div class="row" data-id='TGLIncompleteInstructorTasks'>
						<div class="tile" ng-click='expandTile($event)'>
							<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
							<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-title="Tasks that the instructors havn't completed yet"><i class='fa fa-question'></i></div>
							<h2 class="title">Incomplete Instructor Tasks</h2>
							<table class="table selection">
								<tr ng-repeat='person in awaitingSurvey | orderBy:"name"'>
									<td><div class="link" ng-click='gotoUrl(person)' ng-if='!person.dontShow'>{{person.name}}</div><span ng-if='person.dontShow'>{{person.name}}</span></td>
									<td>{{person.survey}}</td>
								</tr>
							</table>
							<div class="hidden selection"></div>
						</div>
					</div>
					<div class="row" data-id='TGLRoster'>
						<div class="tile" ng-click='expandTile($event)'>
							<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
							<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-title="This tile displays your instructors."><i class='fa fa-question'></i></div>
							<h2 class="title">Roster</h2>
							<table class="table selection">
								<tr ng-repeat='inst in InstructorList | orderBy:"name"'>
									<td><div class='newInst' ng-if='inst.newInst'>New</div></td>
									<td><div ng-click='gotoUrl(inst)' class='link'>{{inst.name}}</div></td>
									<td><a href='#' ng-click='emailSomeone(inst.email)'>{{inst.email}}</a></td>
								</tr>
							</table>
							<div class="hidden"><i class='fa fa-child'></i> - New Instructor</div>
						</div>
					</div>
				</div>
				<div class="col-4" pos='2'>
					<div class="row"></div>
					<div class="row" data-id='TGLTasksToReviewLink'>
						<div class="tile" ng-click='expandTile($event)'>
							<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
							<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-title="Tasks that still need to be reviewed. Select the checkmark to cross them off. Click the link to view the data."><i class='fa fa-question'></i></div>
							<h2 class="title">Tasks To Review</h2>
							<ul class="list selection">
								<li ng-repeat='person in surveysToReview | orderBy:"name"'>
									{{person.name}}
									<ul class="list tasks">
										<li ng-repeat='survey in person.reviews | reverse | limitTo:person.limit'>
											<i class='fa fa-square-o checkbox' ng-click='toggleReviewed(survey)' ng-if='!survey.reviewed'></i>
											<i class='fa fa-check-square-o checkbox' ng-click='toggleReviewed(survey)' ng-if='survey.reviewed'></i> 
											<span ng-if='!survey.reviewed' class='link' ng-click='openSurveyData3(person, survey)'>{{survey.survey}}</span>
											<strike ng-if='survey.reviewed' class='link' ng-click='openSurveyData3(person, survey)'>{{survey.survey}}</strike>
										</li>
										<li ng-if='person.reviews.length > 2' class='link' ng-click='changelimit(person)'>{{person.showAllText}}</li>
									</ul>
								</li>
							</ul>
							<div class="hidden selection"></div>
						</div>
					</div>
				</div>
				<div class="col-4" pos='3'>
					<div class="row"></div>
					<!-- <div class="row" data-id='TGLMessageWall'>
						<div class="tile">
							<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-position='left' data-title="Messages will not alert {{person.first}} {{person.last}}."><i class='fa fa-question'></i></div>
							<h2 class="title">Message Wall</h2>
							<div class='messages'>
								<div class="message" ng-repeat='message in comm.messages' ng-class='message.align == "right" ? "txt-right" : ""'>
									<div class="talk-bubble tri-right" ng-class='message.align == "right" ? "left-top" : "right-top"'>
										<div class="talktext">
											<span class='deleteMsg' ng-if='message.fromEmail == comm.user'>Delete</span>
											<p>{{message.text}}</p>
											<span class='msg-stamp'>{{message.from}} - {{message.when}}</span>
										</div>
									</div>
								</div>
							</div>
							<div class="message-input">
								<input type='text' class="msg-input" placeholder='Type Message...' ng-keypress='msg = messageInput($event, msg)' ng-model='msg'>
							</div>
						</div>
					</div> -->
					<div class="row" data-id='TGLInstructorStandards'>
						<div class='tile' ng-click='InstructorStandardsTileDrillDown($event)'>
							<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
							<div class="backBtnStandards link" ng-click='StandardsBack();' ng-if='InstructorStandardsBack'>Back</div>
							<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-position='left' data-title="This tile displays the average score for each instructor standard. Click on a standard's line in the graph to view individual instructor scores for that standard"><i class='fa fa-question'></i></div>
							<h2 class="title">{{InstructorStandardsTile}}</h2>
							<div>
								<highchart id="TGLInstructorStandards" class='fit' config="TGLInstructorStandards"></highchart>
							</div>
							<div class="hidden selection"></div>
						</div>
					</div>
					<div class="row" data-id='TGLInstructorHours'>
						<div class='tile' ng-click='expandTile($event)'>
							<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
							<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-position='left' data-title='This tile displays the average instructor hours/credit for each instructor.'><i class='fa fa-question'></i></div>
							<h2 class="title">Instructor Hours</h2>
							<div>
								<highchart id="TGLInstructorHours" class='fit' config="TGLInstructorHours"></highchart>
							</div>
							<div class="hidden selection"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- END TGL VIEW -->
	

		<!-- INSTRUCTOR VIEW -->
		<div ng-if='view == "INSTRUCTOR"' class="sortable-row">
			<div class="col-4" pos='1'>
				<div class="row"></div>
				<div class="row" data-id='InstructorCompletedTasks'>
					<div class="tile" ng-click='expandTile($event)'>
						<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
						<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-title='These are the tasks that you completed. The link opens the results.'><i class='fa fa-question'></i></div>
						<h2 class="title">Completed Instructor Tasks</h2>
						<div ng-repeat='course in surveysTaken'>
							<h3 ng-if='course.course != "Surveys"'>{{course.course}}</h3>
							<ul class="list selection" ng-if='course.surveys.length > 0'>
								<li ng-repeat='survey in course.surveys | reverse'>
									<div class='link' ng-click='survey.course = course.course; openSurveyData(survey)'>{{survey.name}}</div>
								</li>
							</ul>
						</div>
						<div ng-if='surveysTaken == 0' class="default-msg">No Completed Tasks</div>
						<div class="hidden selection"></div>
					</div>
				</div>
				<div class="row" data-id='InstructorHoursSpent'>
					<div class="tile" ng-click='expandTile($event)'>
						<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
						<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-title='The total number of hours recorded over the weeks'><i class='fa fa-question'></i></div>
						<h2 class="title">Hours Spent</h2>
						<div>
							<highchart id="InstructorAvgHours" class='fit' config="InstructorAvgHours"></highchart>
						</div>
						<div class="hidden selection"></div>
					</div>
				</div>
				<div class="row">
					<div class='tile' ng-click='expandTile($event)'>
						<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
						<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-title='The self reported performance for one of the five instructor standards.'><i class='fa fa-question'></i></div>
						<h2 class="title">Inspire a Love for Learning</h2>
						<div>
							<highchart id="InstructorInspire" class='fit' config="InstructorInspire"></highchart>
						</div>
						<div class="hidden selection"></div>
					</div>
				</div>
			</div>
			<div class="col-4" pos='2'>
				<div class="row"></div>
				<div class="row" data-id='InstructorSmartGoals'>
					<div class="tile" ng-click='expandTile($event)'>
						<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
						<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-title='The SMART goals set by the instructor during the Week 2 Weekly Reflection'><i class='fa fa-question'></i></div>
						<h2 class="title">SMART Goals</h2>
						<div ng-repeat='course in InstructorGoals'>
							<h3>{{course.course}}</h3>
							<ul class="list selection">
								<li ng-repeat='goal in course.goals'><strong>{{goal.name}}</strong> - {{goal.response}}</li>
							</ul>
						</div>
					</div>
				</div>
				<div class="row" data-id='InstructorStandardOne'>
					<div class='tile' ng-click='expandTile($event)'>
						<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
						<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-title='The self reported performance for one of the five instructor standards.'><i class='fa fa-question'></i></div>
						<h2 class="title">Building Faith in Jesus Christ</h2>
						<div>
							<highchart id="InstructorBuilding" class='fit' config="InstructorBuilding"></highchart>
						</div>
						<div class="hidden selection"></div>
					</div>
				</div>
				<div class="row">
					<div class='tile' ng-click='expandTile($event)'>
						<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
						<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-title='The self reported performance for one of the five instructor standards.'><i class='fa fa-question'></i></div>
						<h2 class="title">Seek Development Opportunities</h2>
						<div>
							<highchart id="InstructorDevelopment" class='fit' config="InstructorDevelopment"></highchart>
						</div>
						<div class="hidden selection"></div>
					</div>
				</div>
			</div>
			<div class="col-4" pos='3'>
				<div class="row"></div>
				<!-- <div class="row" data-id='InstructorMessageWall'>
						<div class="tile">
							<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-position='left' data-title="Messages will not alert {{person.first}} {{person.last}}."><i class='fa fa-question'></i></div>
							<h2 class="title">Message Wall</h2>
							<div class='messages'>
								<div class="message" ng-repeat='message in comm.messages' ng-class='message.align == "right" ? "txt-right" : ""'>
									<div class="talk-bubble tri-right" ng-class='message.align == "right" ? "left-top" : "right-top"'>
										<div class="talktext">
											<p>{{message.text}}</p>
											<span class='msg-stamp'>{{message.from}} - {{message.when}}</span>
										</div>
									</div>
								</div>
							</div>
							<div class="message-input">
								<input type='text' class="msg-input" placeholder='Type Message...' ng-keypress='msg = messageInput($event, msg)' ng-model='msg'>
							</div>
						</div>
					</div>
				</div> -->
				<div class="row">
					<div class='tile' ng-click='expandTile($event)'>
						<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
						<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-position='left' data-title='The self reported performance for one of the five instructor standards.'><i class='fa fa-question'></i></div>
						<h2 class="title">Develop Relationships with and Among Students</h2>
						<div>
							<highchart id="InstructorDevelop" class='fit' config="InstructorDevelop"></highchart>
						</div>
						<div class="hidden selection"></div>
					</div>
				</div>
				<div class="row">	
					<div class='tile' ng-click='expandTile($event)'>
						<!--<div class="left drag-n-drop"><i class='fa fa-arrows-alt'></i></div>-->
						<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-position='left' data-title='The self reported performance for one of the five instructor standards.'><i class='fa fa-question'></i></div>
						<h2 class="title">Embrace University Citizenship</h2>
						<div>
							<highchart id="InstructorCitizen" class='fit' config="InstructorCitizen"></highchart>
						</div>
						<div class="hidden selection"></div>
					</div>
				</div>
			</div>
		</div>
		<!-- END INSTRUCTOR VIEW -->



	</div>

	<!-- OVERLAY -->
	<div class="background-cover"></div>
	<div class="rawDataOverlay">
		<div class="closeOverlay" ng-click='closeOverlay($event)'>X</div>
		<h1 class="title">{{selectedSurvey.title}}</h1>
		<table class="table no-hover selection">
			<tr>
				<th>Question</th>
				<th>Answer</th>
			</tr>
			<tr ng-repeat='s in selectedSurvey.answers'>
				<td>{{s.question}}</td>
				<td>{{s.answer}}</td>
			</tr>
		</table>
	</div>
	<!-- END OVERLAY -->
	<!-- EMAIL OVERLAY -->
	<div class="rawDataOverlay2">
		<div class="closeOverlay" ng-click='closeOverlay($event)'>X</div>
		<h1 class="title">Email</h1>
		<table class="table no-hover selection">
			<tr>
				<td>To</td>
				<td><input type="text" class='email-item' disabled ng-model='email.to'></td>
			</tr>
			<tr>
				<td>From</td>
				<td><input type="text" class='email-item' disabled ng-model='email.from'></td>
			</tr>
			<tr>
				<td>Subject</td>
				<td><input type="text" class='email-item' ng-model='email.subject'></td>
			</tr>
			<tr>
				<td>Body</td>
				<td><textarea class="email-item" ng-model='email.body'></textarea></td>
			</tr>
		</table>
		<div class="btn send" ng-click='send()'>Send</div>
	</div>
	<!-- END EMAIL OVERLAY -->
	
	<!-- SEARCH SCREEN -->
	<div id="enterEmail" style="display:none;">
		<h2>Online Instructor Evaluation Dashboard Portal</h2>
		<input type="text" class="enterEmail-input" placeholder='Email Address' autofocus>
		<div><div class="enter-btn">Enter</div></div>
		<div class="notice">You will only be able to access what you have access to</div>
	</div>
	<!-- END SEARCH SCREEN -->
	
	<!-- ERROR SCREEN -->
	<div id="error" style="display:none">
		<h1 id="errMsg"></h1>
	</div>
	<!-- END ERROR SCREEN -->

	<a href="https://byui.az1.qualtrics.com/SE/?SID=SV_864ehSKcdNERHEh&browser={{survey.browser}}&os={{survey.os}}&email={{survey.email}}&href={{survey.href}}" class="feedback-btn" target='_blank'><i class='fa fa-comments'></i> Feedback</a>
</body>
</html>