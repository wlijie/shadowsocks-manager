const app = angular.module('app');

app
  .controller('HomeController', ['$scope', '$mdMedia', '$mdSidenav', '$state', '$http', '$timeout', '$localStorage',
    ($scope, $mdMedia, $mdSidenav, $state, $http, $timeout, $localStorage) => {
      if ($localStorage.home.status === 'normal') {
        $state.go('user.index');
      } else if ($localStorage.home.status === 'admin') {
        $state.go('admin.index');
      } else {
        $localStorage.admin = {};
        $localStorage.user = {};
        $scope.setMainLoading(false);
      }
      $scope.innerSideNav = true;
      $scope.menuButton = function() {
        if ($mdMedia('gt-sm')) {
          $scope.innerSideNav = !$scope.innerSideNav;
        } else {
          $mdSidenav('left').toggle();
        }
      };
      $scope.menus = [{
        name: '首页',
        icon: 'home',
        click: 'home.index'
      }, {
        name: '登录',
        icon: 'cloud',
        click: 'home.login'
      }, {
        name: '注册',
        icon: 'face',
        click: 'home.signup'
      }];
      $scope.menuClick = (index) => {
        $mdSidenav('left').close();
        $state.go($scope.menus[index].click);
      };
    }
  ])
  .controller('HomeIndexController', ['$scope', '$state',
    ($scope, $state) => {
      $scope.icons = [{
        icon: 'important_devices',
        title: '访问任何内容',
        content: '超快速的VPN服务器遍布94个国家。马上解锁您喜欢的网站和应用。',
      }, {
        icon: 'verified_user',
        title: '安全和匿名',
        content: '我们对您的隐私和安全感到狂热。避免被黑客攻击或追踪，使用强大的加密。',
      }, {
        icon: 'face',
        title: '全天候客户服务',
        content: '在几秒钟内获得帮助，而不是几天。通过在线聊天支持向我们提供任何问',
      }];
      $scope.login = () => { $state.go('home.login'); };
      $scope.signup = () => { $state.go('home.signup'); };
    }
  ])
  .controller('HomeLoginController', ['$scope', '$state', 'homeApi', 'alertDialog', '$localStorage',
    ($scope, $state, homeApi, alertDialog, $localStorage) => {
      $scope.user = {};
      $scope.login = () => {
        alertDialog.loading().then(() => {
          return homeApi.userLogin($scope.user.email, $scope.user.password);
        }).then(success => {
          $localStorage.home.status = success;
          return alertDialog.close().then(() => {
            return success;
          });
        }).then(success => {
          if (success === 'normal') {
            $state.go('user.index');
          } else if (success === 'admin') {
            $state.go('admin.index');
          }
        }).catch(err => {
          alertDialog.show(err, '确定');
        });
      };
      $scope.findPassword = () => {
        alertDialog.loading().then(() => {
          return homeApi.findPassword($scope.user.email);
        })
        .then(success => {
          alertDialog.show(success, '确定');
        }).catch(err => {
          alertDialog.show(err, '确定');
        });
      };
      $scope.enterKey = key => {
        if(key.keyCode === 13) {
          $scope.login();
        }
      };
    }
  ])
  .controller('HomeSignupController', ['$scope', '$state', '$interval', '$timeout', 'homeApi', 'alertDialog',
    ($scope, $state, $interval, $timeout, homeApi, alertDialog) => {
      $scope.user = {};
      $scope.sendCodeTime = 0;
      $scope.sendCode = () => {
        alertDialog.loading().then(() => {
          return homeApi.sendCode($scope.user.email);
        })
        .then(success => {
          alertDialog.show('验证码已发至邮箱', '确定');
          $scope.sendCodeTime = 120;
          const interval = $interval(() => {
            if ($scope.sendCodeTime > 0) {
              $scope.sendCodeTime--;
            } else {
              $interval.cancel(interval);
              $scope.sendCodeTime = 0;
            }
          }, 1000);
        }).catch(err => {
          alertDialog.show(err, '确定');
        });
      };
      $scope.signup = () => {
        alertDialog.loading().then(() => {
          return homeApi.userSignup($scope.user.email, $scope.user.code, $scope.user.password);
        })
        .then(success => {
          alertDialog.show('用户注册成功', '确定').then(success => {
            $state.go('home.login');
          });
        }).catch(err => {
          alertDialog.show(err, '确定');
        });
      };
    }
  ])
  .controller('HomeResetPasswordController', ['$scope', '$http', '$state', '$stateParams', 'alertDialog',
    ($scope, $http, $state, $stateParams, alertDialog) => {
      $scope.user = {};
      const token = $stateParams.token;
      alertDialog.loading().then(() => {
        return $http.get('/api/home/password/reset', {
          params: {
            token
          },
        });
      }).then(() => {
        return alertDialog.close();
      }).catch(() => {
        alertDialog.show('该链接已经失效', '确定').then(() => {
          $state.go('home.index');
        });
      });
      $scope.resetPassword = () => {
        alertDialog.loading();
        $http.post('/api/home/password/reset', {
          token,
          password: $scope.user.password,
        }).then(() => {
          alertDialog.show('修改密码成功', '确定').then(() => {
            $state.go('home.login');
          });
        }).catch(() => {
          alertDialog.show('修改密码失败', '确定');
        });
      };
    }
  ])
  .controller('HomeMacLoginController', ['$scope', '$http', '$state', '$stateParams', '$localStorage',
    ($scope, $http, $state, $stateParams, $localStorage) => {
      const mac = $stateParams.mac;
      $http.post('/api/home/macLogin', {
        mac,
      }).then(() => {
        $localStorage.home.status = 'normal';
        $state.go('user.index');
      }).catch(() => {
        $state.go('home.index');
      });
    }
  ])
  .controller('HomeTelegramLoginController', ['$scope', '$http', '$state', '$stateParams', '$localStorage',
    ($scope, $http, $state, $stateParams, $localStorage) => {
      const token = $stateParams.token;
      $http.post('/api/user/telegram/login', {
        token,
      }).then(() => {
        $localStorage.home.status = 'normal';
        $state.go('user.index');
      }).catch(() => {
        $state.go('home.index');
      });
    }
  ])
;
