'use strict';


// Declare app level module which depends on filters, and services
angular.module('forumApp', ['ngAnimate', 'textAngular', 'ngRoute', 'ngSanitize', 'ui.tinymce', 'angularMoment', 'ui.bootstrap', 'ui.calendar', 'forumApp.filters', 'forumApp.services', 'forumApp.directives', 'forumApp.controllers', 'ngCookies']).
  config(['$sceDelegateProvider', '$routeProvider', function($sceDelegateProvider, $routeProvider) {
    $sceDelegateProvider.resourceUrlWhitelist(['self' ,'*.*.*']);
    $routeProvider.when('/', {templateUrl: '/static/partials/partial1.html', controller: 'MyCtrl1'});
    $routeProvider.when('/calendar/:forum_id', {templateUrl: '/static/partials/partial2.html', controller: 'MyCtrl2'});
    $routeProvider.when('/threads/:sub_id', {templateUrl: '/static/partials/threads.html', controller: 'threadctrl'});
    $routeProvider.when('/threads', {templateUrl: '/static/partials/threads.html', controller: 'threadctrl'});
    $routeProvider.when('/posts/:thread_id', {templateUrl: '/static/partials/posts.html', controller: 'postCtrl'});
    $routeProvider.when('/posts', {templateUrl: '/static/partials/posts.html', controller: 'postCtrl'});
    $routeProvider.when('/make', {templateUrl: '/static/partials/make.html', controller: 'makeCtrl'});
    $routeProvider.when('/login', {templateUrl: '/static/partials/login.html', controller: 'loginCtrl'});
    $routeProvider.when('/register', {templateUrl: '/static/partials/register.html', controller: 'loginCtrl'});
    $routeProvider.when('/join', {templateUrl: '/static/partials/join_forum.html', controller: 'loginCtrl'});
    $routeProvider.when('/profile', {templateUrl: '/static/partials/profile.html', controller: 'profileCtrl'});
    $routeProvider.when('/admin/:forum_id', {templateUrl: '/static/partials/forum_admin.html', controller: 'forumAdminCtrl'});
    $routeProvider.when('/forumhome/:forum_id', {templateUrl: '/static/partials/forumhome.html', controller: 'forumhomeCtrl'});
    $routeProvider.when('/messages', {templateUrl: '/static/partials/messages.html', controller: 'messagesCtrl'});
    $routeProvider.otherwise({redirectTo: '/'});
  }])
  .config(function($locationProvider, $interpolateProvider) {
   // $locationProvider.html5Mode(true);
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
    })
  .run(function($rootScope, $log, $http, $cookies){
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
  })
