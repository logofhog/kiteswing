'use strict';

/* Directives */


angular.module('forumApp.directives', []).

  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
  .directive('postForm', function() {
    var postFormObj = {
        templateUrl:'static/partials/post_form.html',
        replace:true
    }
    return postFormObj
  })
  .directive('threadForm', function() {
    var threadFormObj = {
        templateUrl:'static/partials/thread_form.html',
        replace:false
    }
    return threadFormObj
  })
  .directive('navBar', function() {
    var navBarObj = {
        templateUrl:'static/partials/navbar.html',
        replace:false
    }
    return navBarObj
  })
  .directive('logout', function() {
    var logoutObj = {
        template:'<button ng-click="logout_user()">Logout</button>',
        replace:false
    }
    return logoutObj
  })
  .directive('newSub', function() {
      var newSubObj = {
          templateUrl: 'static/partials/new_sub_form.html'
          }
    return newSubObj
  })
  .directive('viewTabs', function () {
      var viewTabs = {
          templateUrl: 'static/partials/viewtabs.html',
          controller: 'NavCtrl'
      }
      return viewTabs
  })
  .directive('privateMessage', function () {
      var privatemessage = {
          templateUrl: 'static/partials/privatemessage.html',
//          controller: 'messagesCtrl',
           //       var html = element.html();
           //   scope.$apply(function() {
           //   ngModel.$setViewValue('hsdtml');
           //   );
      }
      return privatemessage
  })
  .directive('messagedisplay', function () {
      var message = {
          templateUrl: 'static/partials/messagedisplay.html',
          }
      
      return message
  })
  .directive('singlethread', function () {
      var singlepost = {
          templateUrl: 'static/partials/singlethread.html',
          scope: {thread:'=thread'},
          link: function(scope, element, attrs) {
              scope.lastpage = Math.ceil(scope.thread.post_count/10);
          }
      }
      return singlepost
  })
  .directive('postSubmitForm', function () {
      var postsubmit = {
          templateUrl: 'static/partials/post_submit_form.html'
      }
      return postsubmit
  })
  .directive('editPost',['$compile', function ($compile) {
      var editpost = {
          link: function(scope, element, attrs) {
              element.on('click', function(){
                  var el = $compile('<div post-submit-form></div>')(scope);
                  element.append(el)
              });
          }
      }
      return editpost
  }])
  .directive('scrollOnClick', function() {
        return {
          restrict: 'A',
          link: function(scope, $elm) {
              $elm.on('click', function() {
                  console.log('clicked');
                  $("html, body").animate({scrollTop:$('#postbox').position().top}, "fast");
              });
          }
   }  
  })
  .directive('registerForm', function() {
      var register = {
          templateUrl: 'static/partials/register.html'
      }
      return register
  })
  .directive('loginForm', function() {
      var login = {
          templateUrl: 'static/partials/login.html'
      }
      return login
  })
  .directive('username', function() {
      var username = {
        scope : {
            user:'='
        },
        template: "<span class = 'usernamepopup'> send message to {[{user}]} </span>",
        controller: 'usernameCtrl',
        link: function(scope, element, attrs) {
            element.on('click', function() {
                console.log(scope.user)
                scope.pmModal(scope.user);
            })
        }
      }
      return username
  })
  .directive('userdisplay', function() {
      var user = {
          scope: {
              usersname:'='
          },
          template:"<span class = 'username' popover = '{[{usersname}]}' >{[{usersname}]} </span>",
      }
      return user
  })

            







