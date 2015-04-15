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
    "angularFileUpload", //file upload
    "infinite-scroll",
    "perfect_scrollbar",
    "ngCookies"
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

// Setup authentication with django
MetronicApp.config(['$httpProvider', function($httpProvider) {
    // django and angular both support csrf tokens. This tells
    // angular which cookie to add to what header.
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.contentType = 'application/json';
}]);

MetronicApp.service('authState', function () {    
    return {
        user: undefined
    };
})

MetronicApp.factory('api', ['$resource', '$http', function($resource, $http) {


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
    var api = {
        data: {
            myUser: null,
            myLikes: [],
            likeIds: {}
        }
    };

    api.init = function() {
        this.getLikes();
    };

    api.getLikes = function() {
        var that = this;
        if (that.data.myUser === null) {
            that.getMyUser(this.getLikes);
        } else {
            $http({
                url: "/api/users/" + api.data.myUser.id + "/likes/",
                method: "GET"
            }).success(function(data, status, headers, config) {
                that.data.myLikes = data;
                var likeIds = [];
                that.data.myLikes.forEach(function(elem) {
                   likeIds[elem.track.track.id] = true;
                });
                that.data.likeIds = likeIds;
            }).error(function(data, status, headers, config) {
                console.log("Error getting likes");
                console.log(data);
            })
        }
    };

    api.likeTrack = function(track) {
        if (track === null) {
            return;
        }
        var that = this;
        $http({
            url: "/api/tracks/" + track['id'] + "/like/",
            method: "POST"
        }).success(function(data, status, headers, config) {
            console.log(data);
            that.getLikes();
        }).error(function( data, status, headers, config) {
            console.log("Error liking track");
            console.log(data);
        });
    };

    api.getMyUser = function(callback) {
        var that = this;
        $http({
            url: '/api/users/me/',
            method: 'GET'
        }).success(function(data, status, headers, config) {
            var cleaned = data.my_likes.map(function(elem) { return elem.track });
            that.data.myUser = data;
            that.data.myUser.my_likes = cleaned;
            console.log(data);
            callback.bind(that)();
        }).error(function(data, status, headers, config) {
            console.log("Error getting user in authController");
            console.log("ERROR: " + data);
        });
    };

    api.auth = $resource('/api/auth\\/', {}, {
            login: {method: 'POST', transformRequest: add_auth_header},
            logout: {method: 'DELETE'}
    });
    api.users = $resource('/api/users\\/', {}, {
            create: {method: 'POST'}
    });

    api.trackIsLiked = function(track) {
        if (track === null) {
            return false;
        }
        var trackId = track.id;
        if (this.data.likeIds[trackId] === true) {
            return true;
        }
        return false;
//        var found = false;
//        this.data.likeIds.forEach(function(elem) {
//            if (elem === trackId) {
//                found = true;
//            }
//        });
//        return found;
    };

    api.init();

    return api;
}]);

MetronicApp.controller('authController', function($scope, api, authState, $http, spinnerService) {
    // Angular does not detect auto-fill or auto-complete. If the browser
    // autofills "username", Angular will be unaware of this and think
    // the $scope.username is blank. To workaround this we use the 
    // autofill-event polyfill [4][5]
    $('#id_auth_form input').checkAndTriggerAutoFillEvent();

//    $scope.getMyUser = function() {
//        $http({
//            url: '/api/users/me/',
//            method: 'GET'
//        }).success(function(data, status, headers, config) {
//            api.data.myUser = data;
//        }).error(function(data, status, headers, config) {
//            console.log("Error getting user in authController");
//        });
//    };

    $scope.authState = authState;
    // console.log(authState);

    $scope.makeCredentials = function(){
        // if ($scope.password1 != null && $scope.password2 != null && $scope.password1 === $scope.password2) {
        if ($scope.password1 != null) {
            // console.log(
            //     JSON.stringify({
            //         "username": $scope.user_name,
            //         "first_name": $scope.first_name,
            //         "last_name": $scope.last_name,
            //         "email": $scope.email,
            //         "password": $scope.password1,
            //         "profile_picture": null,
            //         "location": ""
            //     })
            // );
            return JSON.stringify({
                "username": $scope.user_name,
                // "first_name": $scope.first_name,
                "first_name": " ",
                // "last_name": $scope.last_name,
                "last_name": " ",
                "email": $scope.email,
                "password": $scope.password1,
                "profile_picture": null,
                "location": ""
            });
        }
        else {
            alert("Error");
        }
    };

    $scope.getCredentials = function(){
        console.log(
            {username: $scope.user_name, password: $scope.password1}
        );
        return {username: $scope.user_name, password: $scope.password1};
    };

    $scope.login = function(){
        api.auth.login($scope.getCredentials()).
            $promise.
                then(function(data){
                    // on good username and password
                    authState.user = data.username;
                    window.location.href = "/";
                }).
                catch(function(data){
                    // on incorrect username and password
                    alert(data.data.detail);
                });
    };

    $scope.logout = function(){
        api.auth.logout(function(){
            authState.user = undefined;
            window.location.href = "/";
        });
    };

    $scope.register = function($event){
        // prevent login form from firing
        $event.preventDefault();
        // create user and immediatly login on success
        api.users.create($scope.makeCredentials()).
            $promise.
                then($scope.login).
                catch(function(data){
                    alert(data.data.username);
                });
    };

    $scope.getPassword = function(email) {
        $http({
            url: '/api/users/initiate_password_reset/',
            method: "POST",
            data:
            {
                "email": email
            },
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            console.log(data);
            alert("Thanks! Check your email for your token to retrieve password.");
            $('#forgotModal').modal('hide');
            window.location.href = "#/forgot";
        }).error(function (data, status, headers, config) {
            // $scope.status = status;
            console.log(data);
            alert("Try again.");
        });
    }

    $scope.resetPassword = function(token, new_password, confirm_password) {
        if (new_password == confirm_password) {
            $http({
                url: '/api/users/reset_password/',
                method: "POST",
                data:
                {
                    "token": token,
                    "new_password": new_password
                },
                headers: {'Content-Type': 'application/json'}
            }).success(function (data, status, headers, config) {
                console.log(data);
                alert("Password Changed!");
                window.location.href = "#/home";
            }).error(function (data, status, headers, config) {
                // $scope.status = status;
                console.log(data);
                alert("Try again.");
            });
        }
        else {
            alert("Passwords don't match!");
        }
    }

    // [1] https://tools.ietf.org/html/rfc2617
    // [2] https://developer.mozilla.org/en-US/docs/Web/API/Window.btoa
    // [3] https://docs.djangoproject.com/en/dev/ref/settings/#append-slash
    // [4] https://github.com/tbosch/autofill-event
    // [5] http://remysharp.com/2010/10/08/what-is-a-polyfill/
});

MetronicApp.factory('globalPlayerService', function($rootScope, $http, api) {
    var player =  {
        data: {
            currentTrack: null,
            currentTrackData: null,
            trackQueue: [],
            backStack: [],
            isPlaying: false,
            currentIndex: 0,
            trackProgress: 0,
            userTrackQueue: [],
            nextPageUrl: "",
            shouldUpdatePlaybackCount: false
        }
    };

    var broadcast = function (progress) {
      $rootScope.$broadcast('player.data.trackProgress.update', progress);
    };

    player.updateProgress = function (newState) {
      this.data.trackProgress = newState;
      broadcast(this.data.trackProgress);
    };

    player.getDefaultQueue = function () {
        var that = this;
        $http.get('/api/tracks/trending/?filter=daily&page=1').then(function(response) {
            that.loadTrack(response.data.results[0].track);
            that.data.trackQueue = response.data.results.slice(1).map(function(elem) { return elem.track });
            that.data.nextPageUrl = '/api/tracks/trending/?filter=daily&page=2';
            $rootScope.$broadcast('player.data.trackQueue.update', that.data.trackQueue);
        });
    };
    player.playPause = function() {
//        if (this.data.currentTrack == null && this.data.currentTrackData) {
//            this.loadTrack(this.data.currentTrackData, this.playPause);
//            return;
//        }
        if (this.data.isPlaying) {
            this.data.currentTrack.pause();
            this.data.isPlaying = false;
        } else {
            if (this.data.shouldUpdatePlaybackCount) {
                this._incrementPlaycount(this.data.currentTrackData.id);
            }
            this.data.currentTrack.play();
            this.data.isPlaying = true;
        }
    };
    player.resetTrack = function(track) {
        if (this.data.currentTrackData != null && this.data.currentTrackData.sc_id == track.sc_id) {
            this.playPause();
            return;
        } else if (this.data.isPlaying) {
            this.data.currentTrack.pause();
            this.data.isPlaying = false;
        }
        // This is the load spot for playing a new track. Make the increment playcount call here
        this.loadTrack(track, this.playPause);
    };
    player._incrementPlaycount = function (track_id) {
        var url = "/api/tracks/" + track_id + "/played/";
        var that = this;
        $http({
            url: url,
            method: "POST"
        }).success(function (data, status, headers, config) {
            that.data.shouldUpdatePlaybackCount = false;
            console.log(data);
            console.log("Finished updating playback count for track: " + track_id)
        }).error(function (data, status, headers, config) {
            that.data.shouldUpdatePlaybackCount = false;
            console.log("Error updating playback count for track: " + track_id);
            console.log(data);
        });
    };
    player._updatePosition = function() {
        var progress = this.data.currentTrack.position / this.data.currentTrack.durationEstimate;
        if (progress >= 0) {
            this.updateProgress.bind(this)(this.data.currentTrack.position / this.data.currentTrack.durationEstimate);
        } else {
            this.updateProgress.bind(this)(0);
        }
//        console.log('sound '+this.data.currentTrack.id+' playing: ' + this.data.trackProgress);
    };
    player.loadTrack = function(track, callback) {
        // console.log(track);
        this.data.currentTrackData = track;
        var trackId = track.sc_id;
        var that = this;
        SC.stream("/tracks/" + trackId, function(sound){
            sound.options.onfinish = that.playNextTrack.bind(that);
            sound.options.whileplaying = that._updatePosition.bind(that);
            that.data.currentTrack = sound;
            that.data.shouldUpdatePlaybackCount = true;
            callback.bind(that)();
//            that.data.isPlaying = true;
//            sound.play();
        });
    };
    player.playNextTrack = function() {
        if (this.data.trackQueue.length <= 4) {
            this.getNextPageForQueue();
        }
        if (this.data.trackQueue.length) {
            var next = this.data.trackQueue.shift();
            this.data.backStack.push(this.data.currentTrackData);
            this.resetTrack(next);
        }
    };
    player.playPreviousTrack = function() {
        if (this.data.backStack.length) {
            var prev = this.data.backStack.pop();
            this.data.trackQueue.unshift(this.data.currentTrackData);
            this.resetTrack(prev);
        }
    };
    player.getTrackProgress = function() {
        return this.data.trackProgress;
    };
    player.addTrackToQueue = function(track) {
        this.data.trackQueue.unshift(track);
    };
    player.getNextPageForQueue = function() {
        var that = this;
        $http({
            url: that.data.nextPageUrl,
            method: "GET",
            // data: JSON.stringify($scope.form),
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            var newTracks = data.results.map(function(elem) {
                return elem.track;
            });
            that.data.trackQueue = that.data.trackQueue.concat(newTracks);
            that.data.nextPageUrl = data.next;
        }).error(function (data, status, headers, config) {
            console.log("Error getting next page for queue");
            console.log(data);
        });

    };

    return { player: player };
});

MetronicApp.factory('homeService', ['$rootScope', function ($rootScope) {
    var home =  {
        data: {
            panelId: 0,
            panelContestName: null,
            is_Live: false
        }
    };
    return { home: home };
}]);

MetronicApp.factory('spinnerService', ['$rootScope', function ($rootScope) {
    var spinner = {
        data: {
            refresh: true
        }
    };
    return {spinner: spinner};
}]);

MetronicApp.factory('soundcloud', ['$rootScope', function($rootScope) {
    var sc = {
        data: {
            client_id: 'f0b7083f9e4c053ca072c48a26e8567a',
            redirect_uri: 'http://nostrajamus.com/callback/',
            user_id: "",
            username: "",
            recommendedTracks: []
        }
    };

    sc.init = function() {
        SC.initialize({
          client_id: this.data.client_id,
          redirect_uri: this.data.redirect_uri
        });
    };
    
    return {sc: sc};
}]);

//We already have a limitTo filter built-in to angular,
//let's make a startFrom filter
// MetronicApp.filter('startFrom', function() {
//   return function(input, start) {
//     start = +start; //parse to int
//     return input.slice(start);
//   }
// });

/* Setup App Main Controller */
MetronicApp.controller('AppController', ['$scope', '$rootScope', 'spinnerService', function($scope, $rootScope, spinnerService) {
    $scope.$on('$viewContentLoaded', function() {
        Metronic.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive 

        var items = [
        "Nostradamus's famous Prophecies were the precursor awards to the Grammys.",
        "Nostradamus was born in Provence, France but he soon moved to Woodstock, New York.",
        "Nostradamus predicted Kanye's T. Swift and Beck interruptions.",
        "Our whole team has cardboard cutouts of Nostradamus.",
        "Nostradamus is the great-great-great-great grandfather of both Daft Punk members.",
        "Nostradamus crowdsurfed at the first Coachella."
        ];

        var text = items[Math.floor(Math.random()*items.length)];

        $scope.loadingText = text;
    });
}]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial 
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', ['$rootScope', '$scope', '$http', 'authState', 'spinnerService', '$state', 'api', function($rootScope, $scope, $http, authState, spinnerService, $state, api) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initHeader(); // init header
    });

    $scope.api = api
    $rootScope.firstTime = true;
    $scope.firstTime = $rootScope.firstTime;
    // spinnerService.spinner.data.refresh = false;

    $scope.slide = 1;
    $('myCarousel').carousel({
        interval: false
    })

    $scope.setFirst = function() {
        $rootScope.firstTime = false;
        $scope.firstTime = $rootScope.firstTime;
    };

    $scope.getPrev = function() {
        if ($scope.slide > 1) {
            $scope.slide--;
        }
    };

    $scope.getNext = function() {
        if ($scope.slide < 4) {
            $scope.slide++;
        }
    };

    $scope.searchQuery = "";

    $scope.search = function(query) {
        var url = "/api/search/";
        return $http.get(url, {
          params: {
            q: query,
          }
        }).then(function(response){
            console.log(response.data);
            return response.data;
        });
    };

    $scope.onSearchSelect = function(item, model, label) {
        console.log(item);
        if (item.type == 'profile') {
            $state.go('profile.dashboard', {userID: model.id});
//            window.location.href = "/#/profile/" + item.id + "/dashboard/";
        } else if (item.type == 'track') {
            $state.go('tracks', {trackID: item.id});
//            window.location.href = "/#/discover/" + item.id + "/" + item.sc_id + "/";
        }
    };

    $scope.formatLabel = function(model) {
        if (model.type == "track") {
            return model.title;
        } else if (model.type == "profile") {
            return model.username;
        }
    };

    // $scope.authState = authState;
    // console.log($scope.authState);

//    if (!authState.user) { //weird
//        $http.get('/api/users/me').then(function(response) {
//            $scope.myData = response.data;
//            // console.log($scope.myData);
//            return response.data;
//        });
//    }

    $scope.getProfilePicture = function(pic) {
      var src = '';
        
      // if (pic == null) {
            // var randomPic = Math.random()*100;
            // if (randomPic < 100/3) {
            //     return src = '/assets/admin/pages/media/profile/profile-landscape.jpg';
            // }
            // else if (randomPic >= 100/3 && randomPic <= 200/3) {
            //     return src = '/assets/admin/pages/media/profile/profile-swan.jpg';
            // }
            // else if (randomPic > 200/3) {
            //     return src = '/assets/admin/pages/media/profile/profile-car.jpg'; 
            // }
            // return src = '/assets/admin/pages/media/profile/profile-car.jpg';
      // }
      // else {
        return pic;
      // }
    };

    spinnerService.spinner.data.refresh = false;

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
    $urlRouterProvider.otherwise("/");
    // $locationProvider.html5Mode(true);

    $stateProvider

        // Login
        // .state('login', {
        //     url: "/login",
        //     templateUrl: "/assets/views/login.html",
        //     data: {
        //         pageTitle: '| | Log In',
        //         authenticate: false
        //     },
        //     controller: "LoginController",
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

        //                     '/assets/js/controllers/LoginController.js'
        //                 ] 
        //             });
        //         }]
        //     }
        // })

        // Home
        .state('home', {
            url: "/",
            data: {
                pageTitle: '| Home',
                authenticate: false
            },
            views: {
                "main": {
                    templateUrl: "/assets/views/home.html",
                    controller: "HomeController",
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

                                    '/assets/admin/pages/scripts/tasks.js',

                                    '/assets/js/controllers/HomeController.js',
                                    '/assets/js/controllers/GlobalPlayerController.js'
                                ] 
                            });
                        }],
                        contests: ['$http', function($http) {
                            var contestData = [];
                            return $http.get('/api/contests/').then(function(response) {
                                // console.log(response.data);

                                return response.data;
                            });
                        }]
                    }
                },
                "panel": {
                    templateUrl: "/assets/views/homepanel.html",
                    // data: {
                    //     pageTitle: '| Home',
                    //     authenticate: false
                    // },
                    controller: "HomePanelController",
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

                                    '/assets/admin/pages/scripts/tasks.js',

                                    '/assets/js/controllers/HomePanelController.js',
                                    '/assets/js/controllers/GlobalPlayerController.js'
                                ] 
                            });
                        }],
                        contests: ['$http', function($http) {
                            return $http.get('/api/contests/').then(function(response) {
                                // console.log(response.data);
                                return response.data;
                            });
                        }],
                        dailyLeaders: ['$http', function($http) {
                            return $http.get('/api/tracks/trending/?filter=daily').then(function(response) {
                                // console.log(response.data);
                                return response.data;
                            });
                        }]
//                        myData: ['$http', 'authState', function($http, authState) {
//                            // console.log(authState);
//                            if (authState.user.length > 0) {
//                                return $http.get('/api/users/me').then(function(response) {
//                                    // console.log(response.data);
//
//                                    var myContestInfo = [];
//                                    if (response.data.my_entries) {
//                                        for (var i=0; i < response.data.my_entries.length; i++) {
//                                            if (response.data.my_entries[i].is_active) {
//                                                myContestInfo.push(response.data.my_entries[i]);
//                                            }
//                                        }
//                                    }
//
//                                    // return response.data;
//                                    return myContestInfo;
//                                });
//                            }
//                        }]
                    }
                }
            }
        })

        //Forgot Password
        .state('forgot', {
            url: "/forgot",
            templateUrl: "/assets/views/forgot.html",
            data: {
                pageTitle: '| Forgot Password',
                authenticate: false
            },
            controller: "ForgotController",
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

                            '/assets/admin/pages/scripts/tasks.js',

                            '/assets/js/controllers/ForgotController.js',
                            '/assets/js/controllers/GlobalPlayerController.js'
                        ] 
                    });
                }]
            }
        })

        //Callback
        // .state('callback', {
        //     url: "/callback.html",
        //     templateUrl: "/assets/views/callback.html",
        //     data: {
        //         pageTitle: '| Callback',
        //         authenticate: false
        //     },
        //     controller: "GeneralPageController",
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

        //                     '/assets/admin/pages/scripts/tasks.js',

        //                     '/assets/js/controllers/GeneralPageController.js',
        //                     '/assets/js/controllers/GlobalPlayerController.js'
        //                 ] 
        //             });
        //         }]
        //     }
        // })

        // Dashboard
        // .state('dashboard', {
        //     url: "/dashboard",
        //     templateUrl: "/assets/views/dashboard.html",
        //     data: {
        //         pageTitle: '| Home',
        //         authenticate: false
        //     },
        //     controller: "DashboardController",
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

        //                     '/assets/admin/pages/scripts/tasks.js',

        //                     '/assets/js/controllers/DashboardController.js',
        //                     '/assets/js/controllers/GlobalPlayerController.js'
        //                 ] 
        //             });
        //         }],
        //         contests: ['$http', function($http) {
        //             return $http.get('/api/contests/').then(function(response) {
        //                 // console.log(response.data);
        //                 return response.data;
        //             });
        //         }],
        //         myData: ['$http', 'authState', function($http, authState) {
        //             // console.log(authState);
        //             if (authState.user.length > 0) {
        //                 return $http.get('/api/users/me').then(function(response) {
        //                     // console.log(response.data);
        //                     return response.data;
        //                 });
        //             }
        //         }]
        //     }
        // })

        // Open Contests
        .state('opencontests/:contestID', {
            url: "/opencontests/:contestID",
            templateUrl: "/assets/views/contests/opencontests.html",
            data: {
                pageTitle: '| Open Contests',
                authenticate: true
            },
            controller: "OpenContestsController",
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

                            '/assets/js/controllers/OpenContestsController.js'
                        ]
                    });
                }],
                contestInfo: ['$http', '$stateParams', function($http, $stateParams) {
                    return $http.get('/api/contests/' + $stateParams.contestID).then(function(response) {
                        // console.log(response.data);
                        return response.data;
                    });
                }],
                contestEntries: ['$http', '$stateParams', function($http, $stateParams) {
                    return $http.get('/api/contests/' + $stateParams.contestID + '/entries/').then(function(response) {
                        // console.log(response.data);
                        return response.data;
                    });
                }],
                myData: ['$http', function($http) {
                    return $http.get('/api/users/me').then(function(response) {
                        // console.log(response.data);
                        return response.data;
                    });
                }]
            }
        })

        // In Progress Contests
        .state('inprogresscontests/:contestID', {
            url: "/inprogresscontests/:contestID",
            templateUrl: "/assets/views/contests/inprogresscontests.html",
            data: {
                pageTitle: '| In Progress Contests',
                authenticate: true
            },
            controller: "CompletedContestsController",
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

                            '/assets/js/controllers/CompletedContestsController.js'
                        ]
                    });
                }],
                contestInfo: ['$http', '$stateParams', function($http, $stateParams) {
                    return $http.get('/api/contests/' + $stateParams.contestID).then(function(response) {
                        // console.log(response.data);
                        return response.data;
                    });
                }],
                contestEntries: ['$http', '$stateParams', function($http, $stateParams) {
                    return $http.get('/api/contests/' + $stateParams.contestID + '/entries/').then(function(response) {
                        // console.log(response.data);
                        return response.data;
                    });
                }],
                myEntry: ['$http', '$stateParams', function($http, $stateParams) {
                    return $http.get('/api/users/me').then(function(response) {
                        // console.log(response.data);
                        var myTrackInfo;
                        for (var i in response.data.my_entries) {
                            if (response.data.my_entries[i].contest == $stateParams.contestID) {
                                myTrackInfo = response.data.my_entries[i];
                            }
                        }
                        return myTrackInfo;
                    });
                }],
                myInfo: ['$http', '$stateParams', function($http, $stateParams) {
                    return $http.get('/api/users/me').then(function(response) {
                        // console.log(response.data);
                        return response.data;
                    });
                }],
                myRank: ['$http', '$stateParams', function($http, $stateParams) {
                    return $http.get('/api/contests/' + $stateParams.contestID + '/rank/').then(function(response) {
                        // console.log(response.data);
                        return response.data;
                    });
                }]
            }
        })

        // Completed Contests
        .state('completedcontests/:contestID', {
            url: "/completedcontests/:contestID",
            templateUrl: "/assets/views/contests/completedcontests.html",
            data: {
                pageTitle: '| Completed Contests',
                authenticate: true
            },
            controller: "CompletedContestsController",
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

                            '/assets/js/controllers/CompletedContestsController.js'
                        ]
                    });
                }],
                contestInfo: ['$http', '$stateParams', function($http, $stateParams) {
                    return $http.get('/api/contests/' + $stateParams.contestID).then(function(response) {
                        // console.log(response.data);
                        return response.data;
                    });
                }],
                contestEntries: ['$http', '$stateParams', function($http, $stateParams) {
                    return $http.get('/api/contests/' + $stateParams.contestID + '/entries/').then(function(response) {
                        // console.log(response.data);
                        return response.data;
                    });
                }],
                myEntry: ['$http', '$stateParams', function($http, $stateParams) {
                    return $http.get('/api/users/me').then(function(response) {
                        // console.log(response.data);
                        var myTrackInfo;
                        for (var i in response.data.my_entries) {
                            if (response.data.my_entries[i].contest == $stateParams.contestID) {
                                myTrackInfo = response.data.my_entries[i];
                            }
                        }
                        return myTrackInfo;
                    });
                }],
                myInfo: ['$http', '$stateParams', function($http, $stateParams) {
                    return $http.get('/api/users/me').then(function(response) {
                        // console.log(response.data);
                        return response.data;
                    });
                }],
                myRank: ['$http', '$stateParams', function($http, $stateParams) {
                    return $http.get('/api/contests/' + $stateParams.contestID + '/rank/').then(function(response) {
                        // console.log(response.data);
                        return response.data;
                    });
                }]
            }
        })

        // Test
        .state('test', {
            url: "/test",
            templateUrl: "/assets/views/test.html",            
            data: {pageTitle: '| Admin Test Template'},
            controller: "TestController",
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

                            '/assets/js/controllers/TestController.js'
                        ] 
                    });
                }]
                // signups: ['$http', function($http) {
                //     return $http.get('/assets/Signup.json').then(function(response) {
                //         // console.log(response.data);
                //         return response.data;
                //     });
                // }]
            }
        })

        // AngularJS plugins
        // .state('fileupload', {
        //     url: "/file_upload.html",
        //     templateUrl: "views/file_upload.html",
        //     data: {pageTitle: '| AngularJS File Upload'},
        //     controller: "GeneralPageController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load([{
        //                 name: 'angularFileUpload',
        //                 files: [
        //                     '/assets/global/plugins/angularjs/plugins/angular-file-upload/angular-file-upload.min.js',
        //                 ] 
        //             }, {
        //                 name: 'MetronicApp',
        //                 files: [
        //                     '/assets/js/controllers/GeneralPageController.js'
        //                 ]
        //             }]);
        //         }]
        //     }
        // })

        // UI Select
        // .state('uiselect', {
        //     url: "/ui_select.html",
        //     templateUrl: "views/ui_select.html",
        //     data: {pageTitle: '| AngularJS Ui Select'},
        //     controller: "UISelectController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load([{
        //                 name: 'ui.select',
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [
        //                     '/assets/global/plugins/angularjs/plugins/ui-select/select.min.css',
        //                     '/assets/global/plugins/angularjs/plugins/ui-select/select.min.js'
        //                 ] 
        //             }, {
        //                 name: 'MetronicApp',
        //                 files: [
        //                     '/assets/js/controllers/UISelectController.js'
        //                 ] 
        //             }]);
        //         }]
        //     }
        // })

        // UI Bootstrap
        // .state('uibootstrap', {
        //     url: "/ui_bootstrap.html",
        //     templateUrl: "/assets/views/ui_bootstrap.html",
        //     data: {pageTitle: '| AngularJS UI Bootstrap'},
        //     controller: "GeneralPageController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load([{
        //                 name: 'MetronicApp',
        //                 files: [
        //                     '/assets/js/controllers/GeneralPageController.js'
        //                 ] 
        //             }]);
        //         }] 
        //     }
        // })

        // Tree View
        // .state('tree', {
        //     url: "/tree",
        //     templateUrl: "views/tree.html",
        //     data: {pageTitle: '| jQuery Tree View'},
        //     controller: "GeneralPageController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load([{
        //                 name: 'MetronicApp',
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [
        //                     '/assets/global/plugins/jstree/dist/themes/default/style.min.css',

        //                     '/assets/global/plugins/jstree/dist/jstree.min.js',
        //                     '/assets/admin/pages/scripts/ui-tree.js',
        //                     '/assets/js/controllers/GeneralPageController.js'
        //                 ] 
        //             }]);
        //         }] 
        //     }
        // })     

        // Form Tools
        // .state('formtools', {
        //     url: "/form-tools",
        //     templateUrl: "views/form_tools.html",
        //     data: {pageTitle: '| Form Tools'},
        //     controller: "GeneralPageController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load([{
        //                 name: 'MetronicApp',
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [
        //                     '/assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
        //                     '/assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css',
        //                     '/assets/global/plugins/jquery-tags-input/jquery.tagsinput.css',
        //                     '/assets/global/plugins/bootstrap-markdown/css/bootstrap-markdown.min.css',
        //                     '/assets/global/plugins/typeahead/typeahead.css',

        //                     '/assets/global/plugins/fuelux/js/spinner.min.js',
        //                     '/assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
        //                     '/assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
        //                     '/assets/global/plugins/jquery.input-ip-address-control-1.0.min.js',
        //                     '/assets/global/plugins/bootstrap-pwstrength/pwstrength-bootstrap.min.js',
        //                     '/assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js',
        //                     '/assets/global/plugins/jquery-tags-input/jquery.tagsinput.min.js',
        //                     '/assets/global/plugins/bootstrap-maxlength/bootstrap-maxlength.min.js',
        //                     '/assets/global/plugins/bootstrap-touchspin/bootstrap.touchspin.js',
        //                     '/assets/global/plugins/typeahead/handlebars.min.js',
        //                     '/assets/global/plugins/typeahead/typeahead.bundle.min.js',
        //                     '/assets/admin/pages/scripts/components-form-tools.js',

        //                     '/assets/js/controllers/GeneralPageController.js'
        //                 ] 
        //             }]);
        //         }] 
        //     }
        // })        

        // Date & Time Pickers
        // .state('pickers', {
        //     url: "/pickers",
        //     templateUrl: "views/pickers.html",
        //     data: {pageTitle: '| Date & Time Pickers'},
        //     controller: "GeneralPageController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load([{
        //                 name: 'MetronicApp',
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [
        //                     '/assets/global/plugins/clockface/css/clockface.css',
        //                     '/assets/global/plugins/bootstrap-datepicker/css/datepicker3.css',
        //                     '/assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
        //                     '/assets/global/plugins/bootstrap-colorpicker/css/colorpicker.css',
        //                     '/assets/global/plugins/bootstrap-daterangepicker/daterangepicker-bs3.css',
        //                     '/assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',

        //                     '/assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
        //                     '/assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
        //                     '/assets/global/plugins/clockface/js/clockface.js',
        //                     '/assets/global/plugins/bootstrap-daterangepicker/moment.min.js',
        //                     '/assets/global/plugins/bootstrap-daterangepicker/daterangepicker.js',
        //                     '/assets/global/plugins/bootstrap-colorpicker/js/bootstrap-colorpicker.js',
        //                     '/assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',

        //                     '/assets/admin/pages/scripts/components-pickers.js',

        //                     '/assets/js/controllers/GeneralPageController.js'
        //                 ] 
        //             }]);
        //         }] 
        //     }
        // })

        // Custom Dropdowns
        // .state('dropdowns', {
        //     url: "/dropdowns",
        //     templateUrl: "/assets/views/dropdowns.html",
        //     data: {pageTitle: '| Custom Dropdowns'},
        //     controller: "GeneralPageController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load([{
        //                 name: 'MetronicApp',
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [
        //                     '/assets/global/plugins/bootstrap-select/bootstrap-select.min.css',
        //                     '/assets/global/plugins/select2/select2.css',
        //                     '/assets/global/plugins/jquery-multi-select/css/multi-select.css',

        //                     '/assets/global/plugins/bootstrap-select/bootstrap-select.min.js',
        //                     '/assets/global/plugins/select2/select2.min.js',
        //                     '/assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js',

        //                     '/assets/admin/pages/scripts/components-dropdowns.js',

        //                     '/assets/js/controllers/GeneralPageController.js'
        //                 ] 
        //             }]);
        //         }] 
        //     }
        // }) 

        // Advanced Datatables
        // .state('datatablesAdvanced', {
        //     url: "/datatables/advanced.html",
        //     templateUrl: "/assets/views/datatables/advanced.html",
        //     data: {pageTitle: '| Advanced Datatables'},
        //     controller: "GeneralPageController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load({
        //                 name: 'MetronicApp',
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [
        //                     '/assets/global/plugins/select2/select2.css',
        //                     '/assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',
        //                     '/assets/global/plugins/datatables/extensions/Scroller/css/dataTables.scroller.min.css',
        //                     '/assets/global/plugins/datatables/extensions/ColReorder/css/dataTables.colReorder.min.css',

        //                     '/assets/global/plugins/select2/select2.min.js',
        //                     '/assets/global/plugins/datatables/all.min.js',
        //                     '/assets/js/scripts/table-advanced.js',

        //                     '/assets/js/controllers/GeneralPageController.js'
        //                 ]
        //             });
        //         }]
        //     }
        // })

        // Ajax Datetables
        // .state('datatablesAjax', {
        //     url: "/datatables/ajax.html",
        //     templateUrl: "/assets/views/datatables/ajax.html",
        //     data: {pageTitle: '| Ajax Datatables'},
        //     controller: "GeneralPageController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load({
        //                 name: 'MetronicApp',
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [
        //                     '/assets/global/plugins/select2/select2.css',
        //                     '/assets/global/plugins/bootstrap-datepicker/css/datepicker.css',
        //                     '/assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',

        //                     '/assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js',
        //                     '/assets/global/plugins/select2/select2.min.js',
        //                     '/assets/global/plugins/datatables/all.min.js',

        //                     '/assets/global/scripts/datatable.js',
        //                     '/assets/js/scripts/table-ajax.js',

        //                     '/assets/js/controllers/GeneralPageController.js'
        //                 ]
        //             });
        //         }]
        //     }
        // })

        // My User Profile
        .state("profile", {
            url: "/profile/:userID",
            templateUrl: "/assets/views/profile/main.html",
            data: {
                pageTitle: '| User Profile',
                authenticate: false
            },
            controller: "UserProfileController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',  
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            '/assets/admin/pages/css/profile.css',
                            '/assets/admin/pages/css/tasks.css',

                            // angular file upload plugins
//                            '/assets/global/plugins/angularjs/plugins/angular-file-upload/angular-file-upload.min.js',
//                            '/assets/global/plugins/angularjs/plugins/angular-file-upload/angular-file-upload-bower-2.2.2/angular-file-upload-shim.min.js',
//                            '/assets/global/plugins/angularjs/plugins/angular-file-upload/angular-file-upload-bower-2.2.2/angular-file-upload-all.js',
//                            '/assets/global/plugins/angularjs/plugins/angular-file-upload/angular-file-upload-bower-2.2.2/angular-file-upload.js',
                            // /angular file upload plugins
                            
                            '/assets/global/plugins/jquery.sparkline.min.js',
                            '/assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                            '/assets/admin/pages/scripts/profile.js',

                            '/assets/js/controllers/UserProfileController.js',
                        ]
                    });
                }],
                myInfo: ['$http', '$stateParams', function($http, $stateParams) {
                    return $http.get('/api/users/' + $stateParams.userID).then(function(response) {
                        // console.log(response.data);
                        var data = response.data;
                        var cleaned = data.my_likes.map(function(elem) { return elem.track });
                        data.my_likes = cleaned;
                        return data;
                    });
                }],
                me: ['$http', '$stateParams', function($http, $stateParams) {
                    // console.log($stateParams.userID);
                    return $stateParams.userID;
                }]
            }
        })

        // User Profile Dashboard
        .state("profile.dashboard", {
            url: "/dashboard",
            templateUrl: "/assets/views/profile/dashboard.html",
            data: {pageTitle: '| My Profile'}
        })

        // User Profile Account
        .state("profile.account", {
            url: "/account",
            templateUrl: "/assets/views/profile/account.html",
            data: {pageTitle: '| User Account'}
        })

        // Other User Profile
        // .state("profiles/:userID", {
        //     url: "/profiles/:userID",
        //     templateUrl: "/assets/views/profiles/main.html",
        //     data: {pageTitle: '| User Profiles'},
        //     controller: "UserProfilesController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load({
        //                 name: 'MetronicApp',  
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [
        //                     '/assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
        //                     '/assets/admin/pages/css/profile.css',
        //                     '/assets/admin/pages/css/tasks.css',
                            
        //                     '/assets/global/plugins/jquery.sparkline.min.js',
        //                     '/assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

        //                     '/assets/admin/pages/scripts/profile.js',

        //                     '/assets/js/controllers/UserProfilesController.js',
        //                 ]
        //             });
        //         }],
                // myInfo: ['$http', '$stateParams', function($http, $stateParams) {
                //     return $http.get('/api/users/' + $stateParams.userID).then(function(response) {
                //         // console.log(response.data);
                //         return response.data;
                //     });
                // }]
        //     }
        // })

        // Other Profile Dashboard
        // .state("profiles.dashboard/:userID", {
        //     url: "/dashboard/:userID",
        //     templateUrl: "/assets/views/profiles/dashboard.html",
        //     data: {pageTitle: '| Profile'},
        //     resolve: {
        //         myInfo: ['$http', '$stateParams', function($http, $stateParams) {
        //             return $http.get('/api/users/' + $stateParams.userID).then(function(response) {
        //                 console.log(response.data);
        //                 return response.data;
        //             });
        //         }]
        //     }
        // })

        // User Profile Help
        // .state("profile.help", {
        //     url: "/help",
        //     templateUrl: "/assets/views/profile/help.html",
        //     data: {pageTitle: '| User Help'}
        // })

        // My Jams
        // .state('jams', {
        //     url: "/jams",
        //     templateUrl: "/assets/views/jams.html",
        //     data: {pageTitle: '| My Jams'},
        //     controller: "JamsController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load({
        //                 name: 'MetronicApp',
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [
        //                     '/assets/global/plugins/select2/select2.css',
        //                     '/assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',
        //                     '/assets/global/plugins/datatables/extensions/Scroller/css/dataTables.scroller.min.css',
        //                     '/assets/global/plugins/datatables/extensions/ColReorder/css/dataTables.colReorder.min.css',

        //                     '/assets/global/plugins/select2/select2.min.js',
        //                     '/assets/global/plugins/datatables/all.min.js',
        //                     '/assets/js/scripts/table-advanced.js',

        //                     '/assets/js/controllers/JamsController.js'
        //                 ]
        //             });
        //         }]
        //     }
        // })

        // History
        // .state('history', {
        //     url: "/history",
        //     templateUrl: "/assets/views/history.html",
        //     data: {pageTitle: '| History'},
        //     controller: "HistoryController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load({
        //                 name: 'MetronicApp',
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [
        //                     '/assets/global/plugins/select2/select2.css',
        //                     '/assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css',
        //                     '/assets/global/plugins/datatables/extensions/Scroller/css/dataTables.scroller.min.css',
        //                     '/assets/global/plugins/datatables/extensions/ColReorder/css/dataTables.colReorder.min.css',

        //                     '/assets/global/plugins/select2/select2.min.js',
        //                     '/assets/global/plugins/datatables/all.min.js',
        //                     '/assets/js/scripts/table-advanced.js',

        //                     '/assets/js/controllers/HistoryController.js'
        //                 ]
        //             });
        //         }]
        //     }
        // })

        // Todo
        // .state('todo', {
        //     url: "/todo",
        //     templateUrl: "/assets/views/todo.html",
        //     data: {pageTitle: '| Todo'},
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
            data: {
                pageTitle: '| Leaderboard',
                authenticate: false
            },
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
                }],
                leaders: ['$http', function($http) {
                    return $http.get('/api/users/leaderboard/').then(function(response) {
                        // console.log(response.data);
                        return response.data;
                    });
                }]
            }
        })

        //Discover Base
        .state('discover', {
            url: "/discover",
            templateUrl: "/assets/views/discover.html",
            data: {
                pageTitle: '| Discover',
                authenticate: false
            },
            controller: "DiscoverController",
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

                            '/assets/js/controllers/DiscoverController.js'
                        ]
                    });
                }],
                trending: ['$http', function($http) {
                    return $http.get('/api/tracks/trending/?filter=daily&page=1').then(function(response) {
                        // console.log(response.data);
                        return response.data;
                    });
                }],
                viewTrack: ['$http', '$stateParams', function($http, $stateParams) {
                    return null;
                }],
                referralTrack: ['$http', '$stateParams', function($http, $stateParams) {
                    return null;
                }],
                myInfo: ['$http', '$stateParams', function($http, $stateParams) {
                    // console.log($stateParams);
                    return null;
                }]
            }
        })

        //Discover Referral
        .state('discover/:userID/[:trackID]', {
            url: "/discover/:userID/:trackID",
            templateUrl: "/assets/views/discover.html",
            data: {
                pageTitle: '| Discover',
                authenticate: false
            },
            controller: "DiscoverController",
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

                            '/assets/js/controllers/DiscoverController.js'
                        ]
                    });
                }],
                trending: ['$http', function($http) {
                    return $http.get('/api/tracks/trending/?filter=daily&page=1').then(function(response) {
                        // console.log(response.data);
                        return response.data;
                    });
                }],
                viewTrack: ['$http', '$stateParams', function($http, $stateParams) {
                    return null;
                }],
                referralTrack: ['$http', '$stateParams', function($http, $stateParams) {
                    // console.log($stateParams);
                    if ($stateParams.userID && $stateParams.trackID) {
                        return $http.get('/api/users/' + $stateParams.userID).then(function(response) {
                            for (var i = 0; i < response.data.my_entries.length; i++) {
                                if (response.data.my_entries[i].track.sc_id == $stateParams.trackID) {
                                    console.log(response.data.my_entries[i]);
                                    return response.data.my_entries[i]; 
                                }
                            }
                        });
                    }
                }],
                myInfo: ['$http', '$stateParams', function($http, $stateParams) {
                    // console.log($stateParams);
                    return $http.get('/api/users/' + $stateParams.userID).then(function(response) {
                        return response.data;
                    });
                }]
            }
        })

        //Discover Track
        .state('tracks', {
            url: "/tracks/:trackID",
            templateUrl: "/assets/views/discover.html",
            data: {
                pageTitle: '| Discover',
                authenticate: false
            },
            controller: "DiscoverController",
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

                            '/assets/js/controllers/DiscoverController.js'
                        ]
                    });
                }],
                trending: ['$http', function($http) {
                    return $http.get('/api/tracks/trending/?filter=daily&page=1').then(function(response) {
                        // console.log(response.data);
                        return response.data;
                    });
                }],
                viewTrack: ['$http', '$stateParams', function($http, $stateParams) {
                    // console.log($stateParams);
                    if ($stateParams.trackID) {
                        return $http.get('/api/tracks/' + $stateParams.trackID + '/stats/').then(function(response) {
                            return response.data;
                        });
                    }
                }],
                referralTrack: ['$http', '$stateParams', function($http, $stateParams) {
                    return null;
                }],
                myInfo: ['$http', '$stateParams', function($http, $stateParams) {
                    // console.log($stateParams);
                    return null;
                }]
            }
        })

        // Leagues
        .state('leagues', {
            url: "/leagues",
            templateUrl: "/assets/views/leagues.html",
            data: {
                pageTitle: '| Leagues',
                authenticate: true
            },
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
        // .state('discover', {
        //     url: "/discover",
        //     templateUrl: "/assets/views/discover.html",
        //     data: {pageTitle: '| Discover'},
        //     controller: "DiscoverController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load([{
        //                 name: 'MetronicApp',
        //                 files: [
        //                     '/assets/js/controllers/DiscoverController.js'
        //                 ] 
        //             }]);
        //         }] 
        //     }
        // })

        // How
        .state('how', {
            url: "/how",
            templateUrl: "/assets/views/how.html",
            data: {
                pageTitle: '| How It Works',
                authenticate: false
            },
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
            data: {
                pageTitle: '| Message Us',
                authenticate: true
            },
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

        // Admin Controls
        .state("admincontrols", {
            url: "/admincontrols",
            templateUrl: "/assets/views/admincontrols.html",
            data: {
                pageTitle: '| Admin Controls',
                authenticate: true
            },
            controller: "AdminController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
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

                            '/assets/js/controllers/AdminController.js'
                        ]              
                    });
                }]
            }
        })



}]);

/* Init global settings and run the app */
MetronicApp.run(["$rootScope", "settings", "$state", "$anchorScroll", "authState", "spinnerService", function($rootScope, settings, $state, $anchorScroll, authState, spinnerService) {
    $rootScope.$state = $state; // state to be accessed from view
    // $anchorScroll.yOffset = 50;

    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
        // spinnerService.spinner.data.refresh = false;
        // console.log(toState);
        // console.log(fromState);
        // console.log(authState.user);
        if (toState.data.authenticate && !authState.user){
            // User isn’t authenticated
            $state.transitionTo("discover");
            window.location.href = window.location.href;
            event.preventDefault();
        }
    });
}]);