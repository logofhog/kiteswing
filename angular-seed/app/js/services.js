'use strict';


angular.module('forumApp.services', []).
  value('version', '0.1')
  .factory('apiutils', function($q, $http) {
        var handleErrors =  function(serverResponse, status, errorDestination) {
            if (angular.isDefined(errorDestination)) {
                if (status >= 500) {
                    errorDestination.form = 'Server Error: ' + status;
                } else if (status >= 401) {
                    errorDestination.form = 'Unauthorized Error: ' + status;
                } else {
                    angular.forEach(serverResponse, function(value, key) {
                        if (key != '__all__') {
                            errorDestination[key] = angular.isArray(value) ? value.join("<br/>") : value;
                        } else {
                            errorDestination.form = errorDestination.form || '' + key + ':' + angular.isArray(value) ? value.join("<br/>") : value;
                        }
                    });
                }
            }
        };

      var apiutils = {
//          get: function(url) {
//            var deferred = $q.defer();
//              deferred.resolve($http.get(url))
//              return deferred.promise
//             },
          get: function(url, errors) {
              return $http.get(url).success(function(response, status, headers, config){
              }).
            error(function(response, status, headers, config) {
                handleErrors(response, status, errors)
            });
          },
          create: function(url, obj, errors) {
             return $http.post(url, obj, {method:'POST'}).success(function(response, status, headers, config) {
//                angular.extend(obj, response);
            }).
            error(function(response, status, headers, config) {
                handleErrors(response, status, errors)
            });
          },
          getUser: function() {
              return $http.get('api/accounts/1/GetUser').success(function(response, status, headers, config) {
              });
          },
          getMembers:function(pk){
              return $http.get('api/forumadmin/' + pk + '/getmembers/').success(function(response, status, headers, config){
              });
          },
          login: function(user, errors) {
              return $http.post('api/accounts/1/LoginUser/', user).success(function(response, status, headers, config){
              }).
              error(function(response, status, headers, config) {
                  handleErrors(response, status, errors);
              });
          },
          logout_user: function() {
              return $http.get('api/accounts/1/Logout/').success(function(response, status, headers, config){
              })
          },
          join_group: function(group, errors){
              return $http.post('api/accounts/1/JoinForum/', group).success(function(response, status, headers, config){
              }).
            error(function(response, status, headers, config) {
                handleErrors(response, status, errors)
            });
            },
          get_customuser: function() {
              return $http.get('api/profile/').success(function(response, status, headers, config) {
              })
          },
          forumadmin: function(url, pk, obj) {
              console.log(obj)
              return $http.post('api/forumadmin/' + pk + url, obj).success(function(response, status, headers, config) {
              })
          },
          forumadminget: function(url, pk, obj, action) {
              return $http.get('api/forumadmin/' + pk + url, obj, action).success(function(response, status, headers, config) {
              })
          }

      }
        return apiutils;
    })
  .service('VarSetter', function($rootScope) {
      this.active_forum = null;
      this.active_thread = null;
      this.active_sub = null;
      this.active_tab = null;
      this.reload = false;
      this.logged_in = false;

      this.set_logged_in = function(logged_in){
          this.logged_in = logged_in
      }

      this.get_logged_in = function() {
          return this.logged_in
      }
      
      this.reload_items = function() {
          this.reload = !this.reload  
      }

      this.get_reload = function() {
          return this.reload
      }

      this.set_active_tab = function(tab) {
          this.active_tab = tab
      };

      this.get_active_tab = function() {
          return this.active_tab
      };

      this.set_active_forum = function(forum_id) {
          this.active_forum = forum_id
      };

      this.get_active_forum = function() {
          return this.active_forum
      };

      this.set_active_thread = function(thread_id) {
          this.active_thread = thread_id
      };

      this.get_active_thread = function() {
          return this.active_thread
      };

      this.set_active_sub= function(sub) {
          this.active_sub= sub
      };

      this.get_active_sub = function() {
          return this.active_sub
      };
  })

