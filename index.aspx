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
					<input type='text' class="searchInput" placeholder='Search...' ng-model='q' ng-if='searchOpened'>
				</li>
				<li class="right person-drop-down" ng-if='user.isLeader()' ng-click='openRoleMenu($event)'> 
					{{selectedRole}} 
					<div class='arrow-down2'><i class="fa fa-arrow-down"></i></div>
				</li>
				<li class="right" ng-if='user.isLeader()'>View as: </li>
			</ul>
			<div class="dashboard-title">Instructor Management System</div>
		</div>
		<!-- END MENU -->

		<div>
			<ul class="semester-popup-dropdown" ng-show='showRoleMenu'>
				<li ng-repeat="role in roleMenu" ng-class="role.type ? 'menuTitle' : role.selected ? 'selected' : ''" ng-click='redirect(role.href)'>{{role.name}}</li>
			</ul>
			<!-- <ul class="semester-popup-dropdown2" ng-show='showSemesterMenu'>
				<li ng-repeat="item in semesters" ng-class="item.selected ? 'selected' : ''" ng-click='selectedSemesterMenuItem(item)'>{{item}}</li>
			</ul>
			<ul class="semester-popup-dropdown3" ng-show='showCourseMenu'>
				<li ng-repeat='item in courses' ng-class='item.selected ? "selected" : ""' ng-click='selectCourse(item)'>{{item.name}}</li>
			</ul> -->
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

					 <!-- TABLE -->
					 <table class="table selection" ng-if='tile.type == "roster"'>
						<tr ng-repeat='user in tile.data | orderBy:"name"'>
							<td><div class='newInst' ng-if='user.isNew()'>New</div></td>
							<td><div ng-click='redirect(user.getHref())' class='link'>{{user.getFullName()}}</div></td>
							<td><a href='mailto:{{user.getFullEmail()}}'>{{user.getFullEmail()}}</a></td>
						</tr>
					</table>
					 <!-- END TABLE -->

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

</body>
</html>