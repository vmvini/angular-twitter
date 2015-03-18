/**
@toc
1. setup - whitelist, appPath, html5Mode
*/

'use strict';

angular.module('myApp', [
	'ngRoute',
	'ngSanitize',
	'nbTwitter'
]).
config(['$routeProvider', '$locationProvider', '$twitterProvider' , function($routeProvider, $locationProvider, $twitterProvider) {
	/**
	setup - whitelist, appPath, html5Mode
	@toc 1.
	*/
	$locationProvider.html5Mode(false);		//can't use this with github pages / if don't have access to the server

	// var staticPath ='/';
	var staticPath;
	// staticPath ='/angular-services/angular-twitter/';		//local
	staticPath ='/';		//nodejs (local)
	// staticPath ='/angular-twitter/';		//gh-pages
	var appPathRoute ='/';
	var pagesPath =staticPath+'pages/';


	$routeProvider.when(appPathRoute+'home', {templateUrl: pagesPath+'home/home.html'});

	$routeProvider.otherwise({redirectTo: appPathRoute+'home'});

	// start our own configuration - REPLACE THIS WITH YOUR OWN STUFF!


	$twitterProvider.config(options , true);

}]);