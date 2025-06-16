(function () {
  'use strict';

  angular
    .module('adminApp')
    .config(appConfig)
    .run(appRun);

  appConfig.$inject = ['$routeProvider', '$locationProvider'];
  function appConfig($routeProvider, $locationProvider) {
    $routeProvider
      .when('/register', {
        templateUrl:  'templates/register.html',
        controller:   'RegisterController',
        controllerAs: 'vm',
        requiresAuth: false
      })

      .when('/login', {
        templateUrl:  'templates/login.html',
        controller:   'LoginController',
        controllerAs: 'vm',
        requiresAuth: false
      })

      .when('/verify', {
        templateUrl:  'templates/verify.html',
        controller:   'VerifyController',
        controllerAs: 'vm',
        requiresAuth: true,
        minLevel: 1
      })

      .when('/chart', {
        templateUrl:  'templates/chart.html',
        controller:   'ChartController',
        controllerAs: 'vm',
        requiresAuth: true,
        minLevel: 2
      })
      .when('/staff-activity', {
        templateUrl:  'templates/staff-activity.html',
        controller:   'StaffActivityController',
        controllerAs: 'vm',
        requiresAuth: true,
        minLevel:     2
      })
      .when('/staff-reviews', {
        templateUrl:  'templates/staff-reviews.html',
        controller:   'StaffReviewController',
        controllerAs: 'vm',
        requiresAuth: true,
        minLevel:     2
      })
      .when('/profile', {
        templateUrl:  'templates/profile.html',
        controller:   'ProfileController',
        controllerAs: 'vm',
        requiresAuth: true,
      })
      .when('/daily-chats', {
        templateUrl:  'templates/daily-chats.html',
        controller:   'DailyChatsController',
        controllerAs: 'vm',
        requiresAuth: true,
        minLevel:     1
      })
      .when('/chats-by-poi', {
        templateUrl:  'templates/chats-by-poi.html',
        controller:   'ChatsByPoiController',
        controllerAs: 'vm',
        requiresAuth: true,
        minLevel:     1
      })
      .when('/payments-recap', {
        templateUrl: 'templates/payments-recap.html',
        controller:  'PaymentsRecapController',
        controllerAs:'vm',
        minlevel: 1
      })
      .when('/poi-activity', {
        templateUrl:  'templates/poi-activity.html',
        controller:   'PoiActivityController',
        controllerAs: 'vm',
        requiresAuth: true,
        minLevel: 2
      })

      .otherwise({
        redirectTo: '/login'
      });

    $locationProvider.hashPrefix('!');
  }

  appRun.$inject = ['$rootScope', '$location', 'AuthService'];
  function appRun($rootScope, $location, AuthService) {
    $rootScope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      if (next.$$route && next.$$route.requiresAuth) {
        if (!AuthService.isAuthenticated()) {
          event.preventDefault();
          $location.path('/login');
        }
      }
      if (next.$$route && next.$$route.minLevel) {
        const userLevel = parseInt(AuthService.getLevel(), 10);
        if (isNaN(userLevel) || userLevel < next.$$route.minLevel) {
          event.preventDefault();
          if (userLevel === 1) {
            $location.path('/verify');
          } else {
            $location.path('/login');
          }
          return;
        }
      }

      if (next.$$route && (next.$$route.originalPath === '/login' || next.$$route.originalPath === '/register')) {
        if (AuthService.isAuthenticated()) {

            const lvl = parseInt(AuthService.getLevel(), 10);
            if (lvl === 2) {
                event.preventDefault();
                $location.path('/verify');
            } else if (lvl === 1) {
                event.preventDefault();
                $location.path('/verify');
          }
        }
      }
    });
  }
})();