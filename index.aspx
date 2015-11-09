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
	<script type="text/javascript" src='build/crypto.js'></script>
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
	
	<!-- HIDE THE MAIN SCREEN -->
	<div id="fade" style='display:none'>

		<!-- MENU -->
		<div class="menu">
			<ul>
				<li class="logo left" ng-click='redirectHome()'><img src="css/BYUI_logo_white.png" class="byui-logo"></li>
				<li class="page-title left" data-id='name'>{{user.getFullName()}}</li>
				<li class="right back-btn" ng-if='backButton' ng-click='back()'>Back</li>
				<li class="right search" ng-click='openSearch(q)' ng-if='user.canSearch()' id="search">
					<i class='fa fa-search' ng-if='!searchOpened'></i>
					<input type='text' class="searchInput" placeholder='Search...' ng-model='q' ng-if='searchOpened' ng-keydown='searching(q, $event)'>
				</li>
				<li class="right person-drop-down" ng-if='user.isLeader()' ng-click='openRoleMenu($event)'> 
					{{selectedRole}} 
					<div class='arrow-down2'><i class="fa fa-arrow-down"></i></div>
				</li>
				<li class="right" ng-if='user.isLeader()'>View as: </li>
				<li class="course-drop-down right person-drop-down" ng-if='user.showCourseMenu()' ng-click='openCourseMenu($event)'>{{user.selectedCourse() ? user.selectedCourse().getName() : 'All'}}<div class='arrow-down2'><i class="fa fa-arrow-down"></i></div></li>
			</ul>
			<ol class="suggestion" ng-if='suggestions.length > 0'>
				<li ng-repeat='s in suggestions | noDuplicates' ng-click='redirect(s.user.getHref())' ng-class='s.selected ? "selected" : ""'>{{s.user.getRole().getRoleName().toUpperCase().slice(0, 4)}} - {{s.user.getFullName()}}</li>
			</ol>
			<div class="dashboard-title">Instructor Management System</div>
		</div>
		<!-- END MENU -->

		<!-- MOBILE MENU -->
		<div class="mobile-menu-side">
			<ul>
				<li>{{user.getFullName()}}</li>
				<!-- <li ng-click='toggleSubMenu($event)'>{{semester}}
					<ul>
						<li ng-repeat="item in semesters" ng-class="item.selected ? 'selected' : ''" ng-click='selectedSemesterMenuItem(item)'>- {{item}}</li>
					</ul>
				</li> -->
				<li ng-if='backButton' ng-click='back()'>Back</li>
				<li ng-click='toggleSubMenu($event)' ng-if='user.isLeader()'>View As: {{selectedRole}}
					<ul>
						<li ng-repeat="role in roleMenu" ng-class="role.type ? 'menuTitle' : role.selected ? 'selected' : ''" ng-click='redirect(role.href)'>{{role.name}}</li>
					</ul>
				</li>
			</ul>
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
		<div>
			<ul class="semester-popup-dropdown" ng-show='showRoleMenu'>
				<li ng-repeat="role in roleMenu" ng-class="role.type ? 'menuTitle' : role.selected ? 'selected' : ''" ng-click='redirect(role.href)'>{{role.name}}</li>
			</ul>
			<!-- <ul class="semester-popup-dropdown2" ng-show='showSemesterMenu'>
				<li ng-repeat="item in semesters" ng-class="item.selected ? 'selected' : ''" ng-click='selectedSemesterMenuItem(item)'>{{item}}</li>
			</ul> -->
			<ul class="semester-popup-dropdown3" ng-show='showCourseMenu'>
				<li ng-repeat='course in user.getCourses()' ng-click='redirect(course.getHref())'>{{course.getName()}}</li>
				<li ng-click='redirect(user.getHref())'>All</li>
			</ul>
		</div>

		<!-- TILES -->
		<div class="row top"></div>
		<div class="col-4" ng-repeat='col in cols'>
			<div class="row"></div>
			<div class="row" ng-repeat='tile in col'>
				<div class="tile" ng-click='expandTile($event)'>
					<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-position='{{$parent.$index == 2 ? "left" : "right"}}' data-title='{{tile.helpText}}'><i class='fa fa-question'></i></div>
					<h2 class="title">{{tile.title}}</h2>


					<!-- TASK LIST -->
					<ul class="list selection tasks" ng-if='tile.type == "task-list"'>
						<li ng-repeat='person in tile.data | orderBy:"_first"'>
							{{person.user.getFullName()}}
							<ul class="list tasks">
								<li ng-repeat='survey in person.surveys | reverse | limitTo:person.limit'>
									<i class='fa fa-square-o checkbox' ng-click='toggleReviewed(survey)' ng-if='!survey.isReviewed()'></i>
									<i class='fa fa-check-square-o checkbox' ng-click='toggleReviewed(survey)' ng-if='survey.isReviewed()'></i> 
									<span ng-if='!survey.isReviewed()' class='link' ng-click='openSurveyData(survey)'>{{survey.getName()}}</span>
									<strike ng-if='survey.isReviewed()' class='link' ng-click='openSurveyData(survey)'>{{survey.getName()}}</strike>
								</li>
								<li ng-if='person.surveys.length > 2' class='link' ng-click='changelimit(person)'>{{person.showAllText}}</li>
							</ul>
						</li>
					</ul>
					<!-- END TASK LIST -->


					 <!-- SURVEY LIST -->
					 <ul class="list selection" ng-if='tile.type == "survey-list" && tile.data.length > 0'>
							<li ng-repeat='survey in tile.data | reverse'>
								<div class='link' ng-click='openSurveyData(survey)'>{{survey.getName()}}</div>
							</li>
						</ul>
						<div ng-if='tile.type == "survey-list" && tile.data.length == 0' class="default-msg">No Completed Tasks</div>
					 <!-- END SURVEY LIST -->

					 <!-- COURSE SURVEY LIST -->
					 <div ng-repeat='course in tile.data' ng-if='tile.type == "course-survey-list"'>
							<h3>{{course.course.getName()}}</h3>
							<ul class="list selection" ng-if='course.surveys.length > 0'>
								<li ng-repeat='survey in course.surveys | reverse'>
									<div class='link' ng-click='openSurveyData(survey)'>{{survey.getName()}}</div>
								</li>
							</ul>
						</div>
						<!-- END COURSE SURVEY LIST -->

					 <!-- REVIEW LIST -->
					 <ul class="list selection tasks" ng-if='tile.type == "review-list" && tile.data.length > 0'>
							<li ng-repeat='survey in tile.data'>
								<ul>
									<li ng-repeat='difference in survey.differences'><div class='link' ng-click='openSurveyData(survey)'>{{survey.user.getFullName()}} - {{difference}}</div></li>
								</ul>
							</li>
						</ul>
						<div ng-if='tile.type == "review-list" && tile.data.length == 0' class="default-msg">No Completed Tasks</div>
					 <!-- END REVIEW LIST -->

					 <!-- GRAPH -->
					 <div ng-if='tile.type == "graph"'>
					 	<div id="{{tile.config}}" class="fit" ng-init='appendChart(tile)'></div>
					 </div>
					 <!-- END GRAPH -->

					 <!-- ROSTER -->
					 <table class="table selection" ng-if='tile.type == "roster"'>
						<tr ng-repeat='user in tile.data | orderBy:"name"'>
							<td><div class='newInst' ng-if='user.isNew()'>New</div></td>
							<td><div ng-click='redirect(user.getHref())' class='link'>{{user.getFullName()}}</div></td>
							<td><a href='mailto:{{user.getFullEmail()}}'>{{user.getFullEmail()}}</a></td>
							<td><a href="https://outlook.office365.com/owa/#viewmodel=IMailComposeViewModelFactory" target='_blank'><i class='fa fa-envelope'></i></a></td>
						</tr>
					</table>
					 <!-- END ROSTER -->

					 <!-- SMART GOALS -->
					 <div ng-if='tile.type == "smart"'>
					 	<ul class="list selection">
							<li ng-repeat='goal in tile.data'><strong>{{goal.getSmartName()}}</strong> - {{goal.getAnswer()}}</li>
						</ul>
					 </div>
					 <!-- END SMART GOALS -->
				</div>
			</div>
		</div>
		<!-- END TILES -->

		<!-- OVERLAY -->
		<div class="background-cover"></div>
		<div class="rawDataOverlay">
			<div class="closeOverlay" ng-click='closeOverlay($event)'>X</div>
			<h1 class="title">{{selectedSurvey._user.getFullName() + ' - ' + selectedSurvey.getName()}}</h1>
			<table class="table no-hover selection">
				<tr>
					<th>Question</th>
					<th>Answer</th>
				</tr>
				<tr ng-repeat='s in selectedSurvey.getAnswers()'>
					<td>{{s.getText()}}</td>
					<td>{{s.getAnswer()}}</td>
				</tr>
			</table>
		</div>
		<!-- END OVERLAY -->
		
		<a href="https://byui.az1.qualtrics.com/SE/?SID=SV_864ehSKcdNERHEh&browser={{computer.browser}}&os={{computer.os}}&email={{computer.email}}&href={{computer.href}}" class="feedback-btn" target='_blank'><i class='fa fa-comments'></i> Feedback</a>

	</div>
	<!-- END HIDE THE MAIN SCREEN -->

	<div id="searchScreen" style="display:none">
		<!-- SEARCH SCREEN -->
		<div id="enterEmail">
			<h2>Online Instructor Evaluation Dashboard Portal</h2>
			<input type="text" class="enterEmail-input" placeholder='Email Address' ng-keypress='search($event, searchValue)' ng-model='searchValue' autofocus>
			<div><div class="enter-btn">Enter</div></div>
			<div class="notice">You will only be able to access what you have access to</div>
		</div>
		<!-- END SEARCH SCREEN -->
	</div>
	<!-- ERROR SCREEN -->
	<div id="error" style="display:none">
		<h1 id="errMsg"></h1>
	</div>
	<!-- END ERROR SCREEN -->


	<script>
	  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	  ga('create', 'UA-69743303-1', 'auto');
	  ga('send', 'pageview');

	</script>

</body>
</html>