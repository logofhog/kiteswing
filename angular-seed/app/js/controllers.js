'use strict';

/* Controllers */

angular.module('forumApp.controllers', []).
  controller('MyCtrl1', ['$scope', function($scope) {
    $scope.textAngularOpts = {
        textAngularEditors : {
                demo1 : {
        toolbar : [
        {icon : "<i class='icon-code'></i>", name : "html", title : "Toggle Html"},
        {icon : "h1", name : "h1", title : "H1"},
        {icon : "h2", name : "h2", title : "H2"},
        {icon : "pre", name :"pre", title : "Pre"},
        {icon : "<i class='icon-bold'></i>", name : "b", title : "Bold"},
        {icon : "<i class='icon-italic'></i>", name : "i", title : "Italics"},
        {icon : "p", name : "p", title : "Paragraph"},
        {icon : "<i class='icon-list-ul'></i>", name : "ul", title : "Unordered List"},
        {icon : "<i class='icon-list-ol'></i>", name : "ol", title : "Ordered List"},
        {icon : "<i class='icon-rotate-right'></i>", name : "redo",title : "Redo"},
        {icon : "<i class='icon-undo'></i>", name : "undo",title : "Undo"},
        {icon : "<i class='icon-ban-circle'></i>", name : "clear", title : "Clear"},
        {icon : "<i class='icon-file'></i>", name :"insertImage", title : "Insert Image"},
        {icon : "<i class='icon-html5'></i>", name : "insertHtml", title : "Insert Html"},
        {icon : "<i class='icon-link'></i>", name : "createLink", title : "Create Link"}
        ],
        editor : {
            "background" : "white",
            "color" : "gray",
            "text-align" : "left",
            "border" : "3px solid rgba(2,2,2,0.2)",
            "border-radius" : "5px",
            "font-size" : "1.3em",
            "font-family" : "Tahoma"
        },
        html : "<h2>Try me!</h2><p>textAngular is a super cool WYSIWYG Text Editor directive for AngularJS</p><p><b>Features:</b></p><ol><li>Automatic Seamless Two-Way-Binding</li><li>Super Easy <b>Theming</b> Options</li><li>Simple Editor Instance Creation</li><li>Safely Parses Html for Custom Toolbar Icons</li><li>Doesn't Use an iFrame</li><li>Works with Firefox, Chrome, and IE10+</li></ol><p><b>Code at GitHub:</b> <a href='https://github.com/fraywing/textAngular'>Here</a> </p>",

    }
        }
    }
  }])
  .controller('MyCtrl2', ['$scope', '$modal', '$routeParams', function($scope, $modal, $routeParams) {
    $scope.events = [];
    $scope.newevent = [];

//++++++++++++++++ calendar +++++++++++++++++++++++++++++++
    $scope.calendarOptions = {
     calendar: {
        eventClick: function(event) {
        //open new modal for viewing only
        $scope.$apply($scope.viewModal(event));
        },
        header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
        },
    defaultView: 'month',
    selectable: true,
    selectHelper: true,
    select: function(start, end, allDay) {
        $scope.$apply($scope.createModal(start, end, allDay));
        }
        // should call 'unselect' method here
     },
    editable: true
    };
//++++++++++++++++++ end calendar ++++++++++++++++++++++++

    $scope.eventSource = { 
        url: 'api/calendar/' + $routeParams.forum_id +'/',
        className: 'forum_event'
        };
    $scope.eventSources = [$scope.eventSource];

// +++++++++++++++++ view Modal ++++++++++++++++++++++
    $scope.viewModal = function(event) { 
        var viewmodalInstance = $modal.open({
            templateUrl : 'static/partials/viewModal.html',
            controller : 'modalInstanceCtrl',
            resolve: {
                vars : function() {
                    return event
                }
            }
            });

            }
// +++++++++++++++++ end view Modal ++++++++++++++++++++++
//  +++++++++++++++++ Modal +++++++++++++++++++++++++
    $scope.createModal = function(start, end, allDay) { 
        console.log($scope.events)
        var modalInstance = $modal.open({
            templateUrl : 'static/partials/calendarModal.html',
            controller : 'modalInstanceCtrl',
            resolve: {
                vars : function() {
                    return {start: start,
                            end: end,
                            allDay: allDay,
                            oneDay: String(start) == String(end)
                    }
                },
            }
            });

        modalInstance.result.then(function(new_event) {
            if (new_event != null){
                $scope.eventSources.push([new_event]);
            }
        }, function() {
        });
    }; 
// +++++++++++++++++ end Modal ++++++++++++++++++++++
  }])
  .controller('usernameCtrl', ['$scope', '$modal', '$http', 'apiutils', function($scope, $modal, $http, apiutils) {
    $scope.pmModal = function(username) { 
        $scope.username = username;
        console.log(username);
        var modalInstance = $modal.open({
            templateUrl : 'static/partials/pmModal.html',
            controller : 'pmmodalInstanceCtrl',
            resolve: {
                vars : function() {
                    return {receiver: username
                    }
                },
            }
            });
    }
  }])
  .controller('pmmodalInstanceCtrl', ['$scope', '$modalInstance', 'apiutils', 'vars', function($scope, $modalInstance, apiutils, vars) {
      $scope.newmessage = vars;
      $scope.newevent = {};
      
      $scope.cancel = function() {
          $modalInstance.close(null);
      }

      $scope.ok = function() {
      }

      $scope.send_message = function() {
          apiutils.create('/api/messages/', $scope.newmessage, $scope.errors).then(function(response){
              $scope.newmessage = {};
              $scope.showmessage = false;
              $scope.showreply = false;
              if (response.status == 200){
                  alert('Message Sent')
                  $modalInstance.close(null);
              }
              else {
                  alert('Error, message not sent')
              }
      });
      }

}])
  .controller('NavCtrl', ['$scope', '$http', '$location', 'apiutils', 'VarSetter', function($scope, $http, $location, apiutils, VarSetter) {
    $scope.errors = {}

    $scope.message_count = function() {
        apiutils.get('api/profile/1/get_messages/', $scope.errors).then(function(response) {
            $scope.unread_messages = response.data;
        });
    }

//    $scope.message_count()
  
    $scope.loadItems = function(){
        $http.get('/api/forums/').then(function(response) {
            $scope.forums = response.data;
            VarSetter.set_logged_in(true);
        });
    };
     
    $scope.varsetter = VarSetter;
    $scope.active_sub = 0;
    $scope.active_tab = 0; //0 is forums 1 is calendar
    $scope.oneAtATime = true;
    $scope.user = null;

    $scope.get_user = function() {
        apiutils.get_customuser().then(function(response){
            $scope.user = response.data;
        });
    };

    
    $scope.set_active_tab = function(tab) {
        VarSetter.set_active_tab(tab);
        $scope.active_tab = tab;
    }

    $scope.go = function(id) {
        $scope.forum_id = id;
        $scope.active_sub = 0;
        VarSetter.set_active_tab(0);
        $location.path('/forumhome/' + id);
    }

    $scope.subclicker = function(id) {
        $scope.active_sub = id;
        VarSetter.set_active_tab(0);
        $location.path('/threads/' + id)
    }

    $scope.$watch('varsetter.get_active_tab()', function(newVal) {
        $scope.active_tab = newVal;
    });

    $scope.$watch('varsetter.get_logged_in()', function(newVal) {
        if (!newVal){
             $scope.user = null;
             $scope.forums = {};
        }
        else {
             $scope.get_user();
             $scope.logged_in = true;
             $scope.message_count()
             $('loginfullpage').hide();
        }
    });

    $scope.$watch('varsetter.get_reload()', function(val){
        $scope.loadItems();
        });

//    $scope.loadItems();
  }])

  .controller('navbutton', ['$scope', '$http', 'apiutils', 'VarSetter', function($scope, $http, apiutils, VarSetter) {
        
    $scope.clicker = function(url){
    $scope.user = "thomas"
        $scope.a = apiutils.get('api/sub/'+ url).then(function(response){
            return response.data;
        });
    }
  }])

  .controller('threadctrl', ['$anchorScroll', '$scope', '$http', '$routeParams', 'apiutils', 'VarSetter', function($anchorScroll, $scope, $http, $routeParams, apiutils, VarSetter) {
      $scope.itemsPerPage = 20;
    $scope.textAngularOpts = {
        textAngularEditors : {
                demo1 : {
        toolbar : [
        {icon : "<i class='icon-picture'></i>", name :"insertImage", title : "Insert Image"},
        {icon : "<i class='icon-html5'></i>", name : "insertHtml", title : "Insert Html"},
        {icon : "<i class='icon-link'></i>", name : "createLink", title : "Create Link"}
        ],
        editor : {
            "background" : "white",
            "color" : "gray",
            "text-align" : "left",
            "border" : "3px solid rgba(2,2,2,0.2)",
            "border-radius" : "5px",
            "font-size" : "1.3em",
            "font-family" : "Tahoma"
        },
        html : "",

    }
        }
    }
    
    var url = $routeParams.sub_id;
    $scope.showreply = false;

//    $scope.loadItems = function(url){
//        $http.get('api/threads/'+ url).then(function(response){
//            $scope.threads = response.data
//        });
//    }

      $scope.loadItems = function(url, page) {
          if (page) {
              url = url + '/?page=' + page + '#top';
          }
          else {
              url = url + '/?page=1';
          }
           apiutils.get('api/threads/' + url).then(function(response){
                $scope.threads = response.data.results;
                console.log($scope.threads)
                $scope.bigTotalItems = response.data.count;
                $scope.lastpage = Math.ceil(response.data.count / 20);
           });
      }

      // ---------------  pagination ----------------
      $scope.currentPage = 1;
                  
      $scope.bigCurrentPage = 1;
      $scope.selectPage = function(pageNo) {
          $scope.threads = {};
          $scope.loadItems($routeParams.sub_id, pageNo);
          $anchorScroll();
      }

      // ----------------- end pagination -------------
    
    $scope.tinymceOptions = {
          toolbar: "insertfile undo redo | bullist | link image code",
          menubar: false,
          plugins: "link image code",
          relative_urls: false
      }
    $scope.loadItems($routeParams.sub_id);

    $scope.submit_thread = function() {
        $scope.showreply = false;
        var url = $routeParams.sub_id;
        $scope.thread.in_subforum = url;
        apiutils.create('api/threads/', $scope.thread).then(function(response){
            //make post object
            var post = {};
            post.title = $scope.thread.thread_name;
            post.post_body = $scope.thread.body;
//            post.post_body = $scope.textAngularOpts.textAngularEditors.demo1.html;
            post.in_thread = response.data.id;
            post.id = 'new';
            console.log(post)
            //create post after thread is created
            apiutils.create('api/posts/', post).then(function(response){
                $scope.loadItems(url);
                $anchorScroll();
                $scope.thread = {};
                tinyMCE.activeEditor.setContent('')
                });
            return response.data;
        });
    }
  }])
  .controller('postCtrl', ['$location', '$anchorScroll', '$scope', '$http', '$routeParams', 'apiutils', 'VarSetter', function($location, $anchorScroll, $scope, $http, $routeParams, apiutils, VarSetter) {
      $scope.posts = {};
      $scope.page = 2;
      $scope.show_pagination = false;
      $scope.loadItems = function(url, page) {
          if (page) {
              url = url + '/?page=' + page + '#top';
          }
          else {
              url = url + '/?page=1';
          }
           apiutils.get('api/posts/' + url).then(function(response){
                $scope.posts = response.data.results;
                $scope.is_mod = response.data.is_mod
                console.log(response.data);
                $scope.activeUser = response.data.user
                $scope.bigTotalItems = response.data.count;
                if (response.data.next) {
                    $scope.show_reply = false;
                }
                else {
                    $scope.show_reply = true;
                }
                if ($scope.bigTotalItems>10) {
                    $scope.show_pagination = true;
                }
           });
      }

      $scope.editpost = function(post) {
            console.log('clciked controller')
              tinyMCE.activeEditor.setContent(post.post_body)
              $scope.post.id = post.id
              $scope.is_editing = 'true';
      }

      $scope.removeEditMode = function() {
          $scope.post = {};
          tinyMCE.activeEditor.setContent('')
          $scope.is_editing = false;
      }

      // ---------------  pagination ----------------
      $scope.bigCurrentPage = $routeParams.page || 1;;
      $scope.selectPage = function(pageNo) {
          $scope.loadItems($routeParams.thread_id, pageNo);
          $anchorScroll();
      }

      // ----------------- end pagination -------------

      $scope.tinymceOptions = {
          toolbar: "insertfile undo redo | bullist | image media",
          menubar: false,
          plugins: "image autolink media",
          relative_urls: false
      }

      $scope.loadItems($routeParams.thread_id, $routeParams.page);
    
      $scope.submit_post = function(numPages){
          console.log('eeerrr')
          $scope.disable = true
          $scope.post.title = $scope.posts[0].title;
          $scope.is_editing = false;
          if ($scope.post.id == null) {
                $scope.post.id = 'new';              
          }
          var url = $routeParams.thread_id;
          var lastPage = Math.ceil(($scope.bigTotalItems+1)/10)
          $scope.post.in_thread = url;
            apiutils.create('api/posts/', $scope.post).then(function(response){
                $scope.disable = false
                $scope.loadItems(url, lastPage);
                $scope.bigCurrentPage = lastPage;
              console.log($scope.post)
              $scope.post = {};
              tinyMCE.activeEditor.setContent('')
              });
      }
  }])
  .controller('makeCtrl', ['$location', '$scope', '$http', '$routeParams', 'apiutils', 'VarSetter', function($location, $scope, $http, $routeParams, apiutils, VarSetter) {
    $scope.make_forum_submit = function() {
        apiutils.create('api/forums/', $scope.forum).then(function(response){
            $scope.forum = {};
            VarSetter.reload_items();
            $location.path('/');
        });
    }
  }])
  .controller('loginCtrl', ['$window', '$location', '$scope', '$http', '$routeParams', 'apiutils', 'VarSetter', function($window, $location, $scope, $http, $routeParams, apiutils, VarSetter) {
      $scope.user = {};
      $scope.group = {};
      $scope.errors = {};
      $scope.showregister = true;

      $scope.submit_login = function() {
          apiutils.login($scope.user, $scope.errors).then(function(response) {
              $location.path('/');
              VarSetter.reload_items();
              VarSetter.set_logged_in(true);
              $('#loginfullpage').fadeOut(400)
          })
      }
      
      $scope.submit_register = function() {
          if ($scope.user.email = '') {
              $scope.user.email = null;
          }

          apiutils.create('api/accounts/1/register_user/', $scope.user, $scope.errors).then(function(response) {
              $location.path('/');
              VarSetter.set_logged_in(true);
              $('#loginfullpage').fadeOut(400)
          })
          } 
    
      $scope.logout_user = function(){
          apiutils.logout_user().then(function(response){
              VarSetter.set_logged_in(false);
//              $('#loginfullpage').fadeIn(400)
          //    $window.location = "http://www.kiteswing.com"
              $window.location = "/"
          })
      }

      $scope.join_group = function() {
          apiutils.join_group($scope.group, $scope.errors).then(function(reponse){
              VarSetter.reload_items();
          })
      }

  }])
  .controller('profileCtrl', ['$scope', '$http', '$routeParams', 'apiutils', function($scope, $http, $routeParams, apiutils) {
    $scope.errors = {}

    $scope.message_count = function() {
        apiutils.get('api/profile/1/get_messages/', $scope.errors).then(function(response) {
            $scope.unread_messages = response.data;
        });
    }

    $scope.message_count()

    $scope.loadcustomuser = function() {
        apiutils.get_customuser().then(function(response) {
            $scope.customuser = response.data[0];
        })
    }
    $scope.loadcustomuser()
  }])
  .controller('forumAdminCtrl', ['VarSetter', '$scope', '$http', '$routeParams', 'apiutils', '$location', function(VarSetter, $scope, $http, $routeParams, apiutils, $location) {
      $scope.sub = {
        'in_master_forum':  $routeParams.forum_id
          };
      $scope.user = {};

      $scope.make_sub = function() {
          apiutils.forumadmin('/makesub/', $routeParams.forum_id, $scope.sub).then(function(response){
              $scope.sub = {};
              $location.path('/forumhome/' + $routeParams.forum_id +'/')
              VarSetter.reload_items();
          })
      }
      $scope.get_mods = function() {
          apiutils.forumadminget('/getmods/', $routeParams.forum_id).then(function(response){
              console.log(response.data)
              $scope.mods = response.data;
          })

      }
      $scope.add_mod = function() {
          $scope.user.action = 'add';
          apiutils.forumadmin('/editmods/', $routeParams.forum_id, $scope.user).then(function(response){
              console.log(response)
          })
      }

      $scope.delete_mod = function(user_to_delete) {
          console.log(user_to_delete)
          apiutils.forumadmin('/editmods/', $routeParams.forum_id, {'username':user_to_delete, 'action':'remove'}).then(function(response){
              console.log(response)
              $scope.get_mods();
          });
      }
  }])
  .controller('TypeaheadCtrl', ['$scope', '$http', 'apiutils', function($scope, $http, apiutils) {
      $scope.selected = undefined;

      apiutils.getMembers('1').then(function(response){
          $scope.members = response.data;
          console.log($scope.states);
      })

     $scope.select_member = function() {
         console.log('selected;'); 
     }

  }])
  .controller('forumhomeCtrl', ['$scope', '$http', '$routeParams', 'apiutils', function($scope, $http, $routeParams, apiutils) {
      $scope.errors = {};
      $scope.sub = {
          in_master_forum : $routeParams.forum_id
          };

      $scope.loadContent = function() {
          apiutils.get('api/homecontent/' + $scope.sub.in_master_forum + '/', $scope.errors).then(function(response){
              $scope.info = response.data;
              console.log($scope.info)
          });
      }
      $scope.loadContent();





  }])
  .controller('modalInstanceCtrl', ['$scope', 'apiutils', '$modalInstance', 'vars', '$routeParams', function($scope, apiutils, $modalInstance, vars, $routeParams) {
      $scope.vars = vars;
      $scope.newevent = {};
      
      $scope.cancel = function() {
          $modalInstance.close(null);
      }

      var make_date = function(date) {
          var day = date.getDate()
          var month = date.getMonth() +1
          var year = date.getFullYear()
          return (year + '-' + month + '-' + day)
      }

      $scope.ok = function() {
        var event_to_create = {
          title : $scope.newevent.title,
          description : $scope.newevent.description,
          start : make_date($scope.vars.start),
          end : make_date($scope.vars.end),
          oneDay: true,
//          oneDay : (String(start) == String(end)),
          in_master_forum: $routeParams.forum_id 
      }
        apiutils.create('api/calendar/', event_to_create).then(function(response){
            $modalInstance.close(event_to_create);
         }) 
      }


}])
  .controller('messagesCtrl', ['$scope', 'apiutils', function($scope, apiutils) {
      $scope.errors = {};
      $scope.showmessage = false;
      $scope.shownewmessage = false;
      $scope.newmessage = {};
      $scope.showreply = false;
      
      $scope.get_messages = function() {
          apiutils.get('/api/messages/').then(function(response){
          $scope.messages = response.data;
      });
      };

      $scope.get_messages();

      $scope.send_message = function() {
          apiutils.create('/api/messages/', $scope.newmessage, $scope.errors).then(function(response){
              $scope.newmessage = {};
              $scope.showmessage = false;
              $scope.shownewmessage = false;
              $scope.showreply = false;
              if (response.status == 200){
                  alert('Message Sent')
              }
              else {
                  alert('Error, message not sent')
              }
      });
      }

      $scope.markasread = function(id, is_read, index) {
          if (!is_read) {
              $scope.messages[index].is_read = true;
          apiutils.create('/api/messages/' + id + '/markasread/').then(function(response) {
            });
          }
      }
      $scope.reply = function(message) {
          $scope.showreply = true;
          if (!(message.title.substring(0,3) == 're:')) {
            $scope.newmessage.title = 're:' + message.title;
          }
          else {
            $scope.newmessage.title = message.title;
          }

          $scope.newmessage.receiver = message.sender.username;
          $scope.newmessage.body = '<br><br><br><hr><div style = "font-style:italic;">' + message.body + '</div>'
      }

      $scope.deleteMessage = function(index, id) {
             $scope.displayDeleteMessage = false;
          console.log(id)
          apiutils.create('/api/messages/' + id + '/deletemessage/').then(function(response) {

              $scope.showmessage = false;
              $scope.messages.splice(index,1);
            });
      }

      $scope.showDeleteMessage = function(is_show, message) {
             $scope.messagetodelete = message
             $scope.displayDeleteMessage = is_show;

      }
      $scope.tinymceOptions = {
          toolbar: "insertfile undo redo | bullist | link image",
          menubar: false,
          plugins: "link image",
          relative_urls: false
      }
//      $scope.markasread = function(id) {
//          console.log('insisde markasread')
//          apiutils.create('/api/messages/' + id + '/markasread/').then(function(response) {
//              console.log(response);
//              console.log($scope.showmessage);
//          });
//      }

  }])
