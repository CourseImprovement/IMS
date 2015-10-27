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
				<li class="right search" ng-click='openSearch(q)' ng-if='user.canSearch()' id="search">
					<i class='fa fa-search' ng-if='!searchOpened'></i>
					<input type='text' class="searchInput" placeholder='Search...' ng-model='q' ng-if='searchOpened'>
				</li>
				<li class="right person-drop-down" ng-if='user.isLeader()'> 
					AIM 
					<div class='arrow-down2'><i class="fa fa-arrow-down"></i></div>
				</li>
				<li class="right" ng-if='user.isLeader()'>View as: </li>
			</ul>
			<div class="dashboard-title">Instructor Management System</div>
		</div>
		<!-- END MENU -->

		<!-- TILES -->
		<div class="row top"></div>
		<div class="col-4" ng-repeat='col in cols'>
			<div class="row"></div>
			<div class="row" ng-repeat='tile in col'>
				<div class="tile" ng-click='expandTile($event)'>
					<div class="right questionmark" ng-mouseover='questionClick($event)' ng-mouseout='questionClickOut($event)' data-title='tile.helpText'><i class='fa fa-question'></i></div>
					<h2 class="title">{{tile.title}}</h2>


					<!-- LIST -->
					<ul class="list selection tasks" ng-if='tile.type == "task-list"'>
						<li ng-repeat='survey in surveysToReview | reverse | limitTo:TGLLimit'>
							<i class='fa fa-square-o checkbox' ng-click='toggleReviewed(survey)' ng-if='!survey.reviewed'></i>
							<i class='fa fa-check-square-o checkbox' ng-click='toggleReviewed(survey)' ng-if='survey.reviewed'></i> 
							<span ng-if='!survey.reviewed'>{{survey.name}} - <span class='link' ng-click='openSurveyData2(survey)'>{{survey.survey}}</span></span>
							<strike ng-if='survey.reviewed'>{{survey.name}} - <span class='link' ng-click='openSurveyData2(survey)'>{{survey.survey}}</span></strike>
						</li>
						<li ng-if='surveysToReview.length > 2' class='link' ng-click='changelimitTgl()'>{{showAllTextTGL}}</li>
					</ul>
					<!-- END LIST -->

				</div>
			</div>
		</div>
		<!-- END TILES -->
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