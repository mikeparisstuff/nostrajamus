/***
NostraJAMus AngularJS App Main Script
***/

/* Metronic App */
var MetronicApp = angular.module("MetronicApp", [
    "ui.router", 
    "ui.bootstrap", 
    "oc.lazyLoad",
    "ngSanitize",
    "ngResource", //authentication with django
]); 

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);

/* Setup global settings */
MetronicApp.factory('settings', ['$rootScope', function($rootScope) {
    // supported languages
    var settings = {
        layout: {
            // pageSidebarClosed: false, // sidebar state
            pageAutoScrollOnLoad: 0 // auto scroll to top on page load
        },
        layoutImgPath: Metronic.getAssetsPath() + 'admin/layout/img/',
        layoutCssPath: Metronic.getAssetsPath() + 'admin/layout/css/'
    };

    $rootScope.settings = settings;

    return settings;
}]);

// Setup authenitcation with django
MetronicApp.config(['$httpProvider', function($httpProvider) {
    // django and angular both support csrf tokens. This tells
    // angular which cookie to add to what header.
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.contentType = 'application/json';
}]);

MetronicApp.factory('api', ['$resource', function($resource) {
    function add_auth_header(data, headersGetter){
        // as per HTTP authentication spec [1], credentials must be
        // encoded in base64. Lets use window.btoa [2]
        var headers = headersGetter();
        headers['Authorization'] = ('Basic ' + btoa(data.username + ':' + data.password));
    }
    // defining the endpoints. Note we escape url trailing dashes: Angular
    // strips unescaped trailing slashes. Problem as Django redirects urls
    // not ending in slashes to url that ends in slash for SEO reasons, unless
    // we tell Django not to [3]. This is a problem as the POST data cannot
    // be sent with the redirect. So we want Angular to not strip the slashes!
    return {
        auth: $resource('/api/auth\\/', {}, {
            login: {method: 'POST', transformRequest: add_auth_header},
            logout: {method: 'DELETE'}
        }),
        users: $resource('/api/users\\/', {}, {
            create: {method: 'POST'}
        })
    };
}]);

MetronicApp.controller('authController', function($scope, api) {
    // Angular does not detect auto-fill or auto-complete. If the browser
    // autofills "username", Angular will be unaware of this and think
    // the $scope.username is blank. To workaround this we use the 
    // autofill-event polyfill [4][5]
    $('#id_auth_form input').checkAndTriggerAutoFillEvent();

    $scope.getCredentials = function(){
        return {
                username: $scope.username,
                first_name: "",
                last_name: "",
                email: $scope.email,
                password: $scope.password
            };
    };

    $scope.login = function(){
        api.auth.login($scope.getCredentials()).
            $promise.
                then(function(data){
                    // on good username and password
                    $scope.user = data.username;
                }).
                catch(function(data){
                    // on incorrect username and password
                    alert(data.data.detail);
                });
    };

    $scope.logout = function(){
        api.auth.logout(function(){
            $scope.user = undefined;
        });
    };
    $scope.register = function($event){
        // prevent login form from firing
        $event.preventDefault();
        // create user and immediatly login on success
        api.users.create($scope.getCredentials()).
            $promise.
                then($scope.login).
                catch(function(data){
                    alert(data.data.username);
                });
    };

    // [1] https://tools.ietf.org/html/rfc2617
    // [2] https://developer.mozilla.org/en-US/docs/Web/API/Window.btoa
    // [3] https://docs.djangoproject.com/en/dev/ref/settings/#append-slash
    // [4] https://github.com/tbosch/autofill-event
    // [5] http://remysharp.com/2010/10/08/what-is-a-polyfill/
});

// /Setup authentication with django

/* Setup App Main Controller */
MetronicApp.controller('AppController', ['$scope', '$rootScope', function($scope, $rootScope) {
    $scope.$on('$viewContentLoaded', function() {
        Metronic.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive 
    });
}]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial 
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initHeader(); // init header
    });
}]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initSidebar(); // init sidebar
    });
}]);

/* Setup Layout Part - Theme Panel */
MetronicApp.controller('ThemePanelController', ['$scope', function($scope) {    
    $scope.$on('$includeContentLoaded', function() {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Footer */
MetronicApp.controller('FooterController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initFooter(); // init footer
    });
}]);

/* Setup Routing For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/dashboard");
    // $urlRouterProvider.when("/dashboard","/login");

    $stateProvider

        // Login
        .state('login', {
            url: "/login",
            templateUrl: "/assets/views/login.html",
            data: {pageTitle: 'Log In'},
            controller: "LoginController",
            authenticate: false,
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '/assets/global/plugins/morris/morris.css',
                            '/assets/admin/pages/css/tasks.css',
                            
                            '/assets/global/plugins/morris/morris.min.js',
                            '/assets/global/plugins/morris/raphael-min.js',
                            '/assets/global/plugins/jquery.sparkline.min.js',

                            '/assets/admin/pages/scripts/index3.js',
                            '/assets/admin/pages/scripts/tasks.js',

                            '/assets/js/controllers/LoginController.js'
                        ] 
                    });
                }]
            }
        })

        // Dashboard
        .state('dashboard', {
            url: "/dashboard",
            templateUrl: "/assets/views/dashboard.html",
            data: {pageTitle: 'Home'},
            controller: "DashboardController",
            authenticate: true,
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '/assets/global/plugins/morris/morris.css',
                            '/assets/admin/pages/css/tasks.css',
                            
                            '/assets/global/plugins/morris/morris.min.js',
                            '/assets/global/plugins/morris/raphael-min.js',
                            '/assets/global/plugins/jquery.sparkline.min.js',

                            '/assets/admin/pages/scripts/index3.js',
                            '/assets/admin/pages/scripts/tasks.js',

                            '/assets/js/controllers/DashboardController.js'
                        ] 
                    });
                }]
            }
        })

        // Test
        // .state('test', {
        //     url: "/test.html",
        //     templateUrl: "views/test.html",            
        //     data: {pageTitle: 'Admin Test Template'},
        //     controller: "TestController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load({
        //                 name: 'MetronicApp',
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
        //                 files: [
        //                     '/assets/global/plugins/morris/morris.css',
        //                     '/assets/admin/pages/css/tasks.css',
                            
        //                     '/assets/global/plugins/morris/morris.min.js',
        //                     '/assets/global/plugins/morris/raphael-min.js',
        //                     '/assets/global/plugins/jquery.sparkline.min.js',

        //                     '/assets/admin/pages/scripts/index3.js',
        //                     '/assets/admin/pages/scripts/tasks.js',

        //                     'js/controllers/TestController.js'
        //                 ] 
        //             });
        //         }],
        //         signups: ['$http', function($http) {
        //             return $http.get('/assets/Signup.json').then(function(response) {
        //                 // console.log(response.data);
        //                 return response.data;
        //             });
        //         }]
        //     }
        // })

        // AngularJS plugins
        .state('fileupload', {
            url: "/file_upload.html",
            templateUrl: "views/file_upload.html",
            data: {pageTitle: 'AngularJS File Upload'},
            controller: "GeneralPageController",
            authenticate: true,
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'angularFileUpload',
                        files: [
                            '/assets/global/plugins/angularjs/plugins/angular-file-upload/angular-file-upload.min.js',
                        ] 
                    }, {
                        name: 'MetronicApp',
                        files: [
                            '/assets/js/controllers/GeneralPageController.js'
                        ]
                    }]);
                }]
            }
        })

        // UI Select
        .state('uiselect', {
            url: "/ui_select.html",
            templateUrl: "views/ui_select.html",
            data: {pageTitle: 'AngularJS Ui Select'},
            controller: "UISelectController",
            authenticate: true,
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'ui.select',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/assets/global/plugins/angularjs/plugins/ui-select/select.min.css',
                            '/assets/global/plugins/angularjs/plugins/ui-select/select.min.js'
                        ] 
                    }, {
                        name: 'MetronicApp',
                        files: [
                            '/assets/js/controllers/UISelectController.js'
                        ] 
                    }]);
                }]
            }
        })

        // UI Bootstrap
        .state('uibootstrap', {
            url: "/ui_bootstrap.html",
            templateUrl: "views/ui_bootstrap.html",
            data: {pageTitle: 'AngularJS UI Bootstrap'},
            controller: "GeneralPageController",
            authenticate: true,
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            '/assets/js/controllers/GeneralPageController.js'
                        ] 
                    }]);
                }] 
            }
        })

        // Tree View
        .state('tree', {
            url: "/tree",
            templateUrl: "views/tree.html",
            data: {pageTitle: 'jQuery Tree View'},
            controller: "GeneralPageController",
            authenticate: true,
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/assets/global/plugins/jstree/dist/themes/default/style.min.css',

                            '/assets/global/plugins/jstree/dist/jstree.min.js',
                            '/assets/admin/pages/scripts/ui-tree.js',
                            '/assets/js/controllers/GeneralPageController.js'
                        ] 
                    }]);
                }] 
            }
        })     

        // Form Tools
        .state('formtools', {
            url: "/form-tools",
            templateUrl: "views/form_tools.html",
            data: {pageTitle: 'Form Tools'},
            controller: "GeneralPageController",
            authenticate: true,
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            '/assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css',
                            '/assets/global/plugins/jquery-tags-input/jquery.tagsinput.css',
                            '/assets/global/plugins/bootstrap-markdown/css/bootstrap-markdown.min.css',
                            '/assets/global/plugins/typeahead/typeahead.css',

                            '/assets/global/plugins/fuelux/js/spinner.min.js',
                            '/assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                            '/assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                            '/assets/global/plugins/jquery.input-ip-address-control-1.0.min.js',
                            '/assets/global/plugins/bootstrap-pwstrength/pwstrength-bootstrap.min.js',
                            '/assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js',
                            '/assets/global/plugins/jquery-tags-input/jquery.tagsinput.min.js',
                            '/assets/global/plugins/bootstrap-maxlength/bootstrap-maxlength.min.js',
                            '/assets/global/plugins/bootstrap-touchspin/bootstrap.touchspin.js',
                            '/assets/global/plugins/typeahead/handlebars.min.js',
                            '/assets/global/plugins/typeahead/typeahead.bundle.min.js',
                            '/assets/admin/pages/scripts/components-form-tools.js',

                            '/assets/js/controllers/GeneralPageController.js'
                        ] 
                    }]);
                }] 
            }
        })        

        // Date & Time Pickers
        .state('pickers', {
            url: "/pickers",
            templateUrl: "views/pickers.html",
            data: {pageTitle: 'Date & Time Pickers'},
            controller: "GeneralPageController",
            authenticate: true,
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/assets/global/plugins/clockface/css/clockface.css',
                            '/assets/global/plugins/bootstrap-datepicker/css/datepicker3.css',
                            '/assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
                            '/assets/global/plugins/bootstrap-colorpicker/css/colorpicker.css',
                            '/assets/global/plugins/bootstrap-daterangepicker/daterangepicker-bs3.css',
                            '/assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',

                            '/assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            '/assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            '/assets/global/plugins/clockface/js/clockface.js',
                            '/assets/global/plugins/bootstrap-daterangepicker/moment.min.js',
                            '/assets/global/plugins/bootstrap-daterangepicker/daterangepicker.js',
                            '/assets/global/plugins/bootstrap-colorpicker/js/bootstrap-colorpicker.js',
                            '/assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',

                            '/assets/admin/pages/scripts/components-pickers.js',

                            '/assets/js/controllers/GeneralPageController.js'
                        ] 
                    }]);
                }] 
            }
        })

        // Custom Dropdowns
        .state('dropdowns', {
            url: "/dropdowns",
            templateUrl: "views/dropdowns.html",
            data: {pageTitle: 'Custom Dropdowns'},
            controller: "GeneralPageController",
            authenticate: true,
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/assets/global/plugins/bootstrap-select/bootstrap-select.min.css',
                            '/assets/global/plugins/select2/select2.css',
                            '/assets/global/plugins/jquery-multi-select/css/multi-select.css',

                            '/assets/global/plugins/bootstrap-select/bootstrap-select.min.js',
                            '/assets/global/plugins/select2/select2.min.js',
                            '/assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',

                            '/assets/admin/pages/scripts/components-dropdowns.js',

                            '/assets/js/controllers/GeneralPageController.js'
                        ] 
                    }]);
                }] 
            }
        }) 

        // Advanced Datatables
        .state('datatablesAdvanced', {
            url: "/datatables/advanced.html",
            templateUrl: "views/datatables/advanced.html",
            data: {pageTitle: 'Advanced Datatables'},
            controller: "GeneralPageController",
            authenticate: true,
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/assets/global/plugins/select2/select2.css',
                            '/assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',
                            '/assets/global/plugins/datatables/extensions/Scroller/css/dataTables.scroller.min.css',
                            '/assets/global/plugins/datatables/extensions/ColReorder/css/dataTables.colReorder.min.css',

                            '/assets/global/plugins/select2/select2.min.js',
                            '/assets/global/plugins/datatables/all.min.js',
                            '/assets/js/scripts/table-advanced.js',

                            '/assets/js/controllers/GeneralPageController.js'
                        ]
                    });
                }]
            }
        })

        // Ajax Datetables
        .state('datatablesAjax', {
            url: "/datatables/ajax.html",
            templateUrl: "views/datatables/ajax.html",
            data: {pageTitle: 'Ajax Datatables'},
            controller: "GeneralPageController",
            authenticate: true,
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/assets/global/plugins/select2/select2.css',
                            '/assets/global/plugins/bootstrap-datepicker/css/datepicker.css',
                            '/assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',

                            '/assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            '/assets/global/plugins/select2/select2.min.js',
                            '/assets/global/plugins/datatables/all.min.js',

                            '/assets/global/scripts/datatable.js',
                            '/assets/js/scripts/table-ajax.js',

                            '/assets/js/controllers/GeneralPageController.js'
                        ]
                    });
                }]
            }
        })

        // User Profile
        .state("profile", {
            url: "/profile",
            templateUrl: "/assets/views/profile/main.html",
            data: {pageTitle: 'User Profile'},
            controller: "UserProfileController",
            authenticate: true,
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',  
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            '/assets/admin/pages/css/profile.css',
                            '/assets/admin/pages/css/tasks.css',
                            
                            '/assets/global/plugins/jquery.sparkline.min.js',
                            '/assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                            '/assets/admin/pages/scripts/profile.js',

                            '/assets/js/controllers/UserProfileController.js'
                        ]                    
                    });
                }]
            }
        })

        // User Profile Dashboard
        .state("profile.dashboard", {
            url: "/dashboard",
            templateUrl: "/assets/views/profile/dashboard.html",
            data: {pageTitle: 'User Profile'},
            authenticate: true
        })

        // User Profile Account
        .state("profile.account", {
            url: "/account",
            templateUrl: "/assets/views/profile/account.html",
            data: {pageTitle: 'User Account'},
            authenticate: true
        })

        // User Profile Help
        .state("profile.help", {
            url: "/help",
            templateUrl: "/assets/views/profile/help.html",
            data: {pageTitle: 'User Help'},
            authenticate: true     
        })

        // My Jams
        .state('jams', {
            url: "/jams",
            templateUrl: "/assets/views/jams.html",
            data: {pageTitle: 'My Jams'},
            controller: "JamsController",
            authenticate: true,
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/assets/global/plugins/select2/select2.css',
                            '/assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',
                            '/assets/global/plugins/datatables/extensions/Scroller/css/dataTables.scroller.min.css',
                            '/assets/global/plugins/datatables/extensions/ColReorder/css/dataTables.colReorder.min.css',

                            '/assets/global/plugins/select2/select2.min.js',
                            '/assets/global/plugins/datatables/all.min.js',
                            '/assets/js/scripts/table-advanced.js',

                            '/assets/js/controllers/JamsController.js'
                        ]
                    });
                }]
            }
        })

        // Current Contests
        .state('contests', {
            url: "/contests",
            templateUrl: "/assets/views/contests.html",
            data: {pageTitle: 'My Contests'},
            controller: "ContestsController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/assets/global/plugins/select2/select2.css',
                            '/assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',
                            '/assets/global/plugins/datatables/extensions/Scroller/css/dataTables.scroller.min.css',
                            '/assets/global/plugins/datatables/extensions/ColReorder/css/dataTables.colReorder.min.css',

                            '/assets/global/plugins/select2/select2.min.js',
                            '/assets/global/plugins/datatables/all.min.js',
                            '/assets/js/scripts/table-advanced.js',

                            '/assets/js/controllers/ContestsController.js'
                        ]
                    });
                }]
            }
        })

        // History
        .state('history', {
            url: "/history",
            templateUrl: "/assets/views/history.html",
            data: {pageTitle: 'History'},
            controller: "HistoryController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/assets/global/plugins/select2/select2.css',
                            '/assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',
                            '/assets/global/plugins/datatables/extensions/Scroller/css/dataTables.scroller.min.css',
                            '/assets/global/plugins/datatables/extensions/ColReorder/css/dataTables.colReorder.min.css',

                            '/assets/global/plugins/select2/select2.min.js',
                            '/assets/global/plugins/datatables/all.min.js',
                            '/assets/js/scripts/table-advanced.js',

                            '/assets/js/controllers/HistoryController.js'
                        ]
                    });
                }]
            }
        })

        // Todo
        // .state('todo', {
        //     url: "/todo",
        //     templateUrl: "/assets/views/todo.html",
        //     data: {pageTitle: 'Todo'},
        //     controller: "TodoController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load({ 
        //                 name: 'MetronicApp',  
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [
        //                     '/assets/global/plugins/bootstrap-datepicker/css/datepicker3.css',
        //                     '/assets/global/plugins/select2/select2.css',
        //                     '/assets/admin/pages/css/todo.css',
                            
        //                     '/assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
        //                     '/assets/global/plugins/select2/select2.min.js',

        //                     '/assets/admin/pages/scripts/todo.js',

        //                     'js/controllers/TodoController.js'  
        //                 ]                    
        //             });
        //         }]
        //     }
        // })

        // Leaderboard
        .state('leaderboard', {
            url: "/leaderboard",
            templateUrl: "/assets/views/leaderboard.html",
            data: {pageTitle: 'Leaderboard'},
            controller: "LeaderboardController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/assets/global/plugins/select2/select2.css',
                            '/assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',
                            '/assets/global/plugins/datatables/extensions/Scroller/css/dataTables.scroller.min.css',
                            '/assets/global/plugins/datatables/extensions/ColReorder/css/dataTables.colReorder.min.css',

                            '/assets/global/plugins/select2/select2.min.js',
                            '/assets/global/plugins/datatables/all.min.js',
                            '/assets/js/scripts/table-advanced.js',

                            '/assets/js/controllers/LeaderboardController.js'
                        ]
                    });
                }]
            }
        })

        // Leagues
        .state('leagues', {
            url: "/leagues",
            templateUrl: "/assets/views/leagues.html",
            data: {pageTitle: 'Leagues'},
            controller: "LeaguesController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/assets/global/plugins/select2/select2.css',
                            '/assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',
                            '/assets/global/plugins/datatables/extensions/Scroller/css/dataTables.scroller.min.css',
                            '/assets/global/plugins/datatables/extensions/ColReorder/css/dataTables.colReorder.min.css',

                            '/assets/global/plugins/select2/select2.min.js',
                            '/assets/global/plugins/datatables/all.min.js',
                            '/assets/js/scripts/table-advanced.js',

                            '/assets/js/controllers/LeaguesController.js'
                        ]
                    });
                }]
            }
        })

        // Discover
        .state('discover', {
            url: "/discover",
            templateUrl: "/assets/views/discover.html",
            data: {pageTitle: 'Discover'},
            controller: "DiscoverController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            '/assets/js/controllers/DiscoverController.js'
                        ] 
                    }]);
                }] 
            }
        })

        // How
        .state('how', {
            url: "/how",
            templateUrl: "/assets/views/how.html",
            data: {pageTitle: 'How It Works'},
            controller: "HowController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            '/assets/js/controllers/HowController.js'
                        ] 
                    }]);
                }] 
            }
        })

        // Message
        .state('message', {
            url: "/message",
            templateUrl: "/assets/views/message.html",
            data: {pageTitle: 'Message Us'},
            controller: "MessageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({ 
                        name: 'MetronicApp',  
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/assets/global/plugins/bootstrap-datepicker/css/datepicker3.css',
                            '/assets/global/plugins/select2/select2.css',
                            '/assets/admin/pages/css/todo.css',
                            
                            '/assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
                            '/assets/global/plugins/select2/select2.min.js',

                            '/assets/admin/pages/scripts/todo.js',

                            '/assets/js/controllers/MessageController.js'
                        ]                    
                    });
                }]
            }
        })

}]);

/* Init global settings and run the app */
MetronicApp.run(["$rootScope", "settings", "$state", function($rootScope, settings, $state, AuthService) {
    // Auth
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
        if (toState.authenticate && !AuthService.isAuthenticated()){
            // User isn’t authenticated
            $state.transitionTo("login");
            event.preventDefault();
        }
    })
    // /Auth
    $rootScope.$state = $state; // state to be accessed from view
}]);