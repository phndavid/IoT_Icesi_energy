angular.module('app', ['ngRoute', 'firebase'])
.value('FirebaseUrl', 'https://triviaahorroenergia.firebaseio.com/')
.config(['$routeProvider','$locationProvider',function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl:'home.html'
    })
    .when('/login', {
      controller:'AuthCtrl as auth',
      templateUrl:'login.html'
    })
    .when('/signup', {
      controller:'AuthCtrl as auth',
      templateUrl:'signup.html'
    })
    .when('/dashboard', {
      controller:'AuthCtrl as auth',
      templateUrl:'dashboard.html'
    })
    .otherwise({
      redirectTo:'/'
    });
    $locationProvider.html5Mode(true);
}])
.controller('AuthCtrl', function($location, Auth, Users) {
    var self = this;
    self.user = {
      email: '',
      password: '',
      name: ''
    };
    self.register = function() {
      console.log('reg');
      Auth.$createUser(self.user).then(function(user) {
        Auth.$authWithPassword(self.user)
          .then(function(authData) {
            Users.save({
              uid: authData.uid,
              name: self.user.name
            });
            self.user.email = '';
            self.user.password = '';
            self.user.name = ''; 
          })
          .catch(function(error) {
          
          });
      }, function(error) {
        self.error = error;
      });
     
    };
    self.loginUser = {
      email: '',
      password: ''
    }
    self.login = function(){
      Auth.$authWithPassword(self.loginUser)
        .then(function(authData) {
         console.log("Logged in as:", authData.uid);
          $location.path('/dashboard')
        })
        .catch(function(error) {
        console.error("Authentication failed:", error);
      });
    };
    self.logout = function(){
      Auth.$unauth();
    };
})
.controller('DevicesCtrl', function(Users,FirebaseUrl,$firebaseObject){
   var self = this;
   self.device = {
      idDevice:''
   };
   self.histories = [{
      idDevice: 'device01',
      power : '60',
      status: 'on',
      hour:'12:00',
      date:'5/4/1995'
   }];
   self.associateDevice = function(){
    var authData = Users.getUser();
    console.log("Data: "+authData);
    if (authData) {
      console.log("Authenticated user with uid:", authData.uid);
      var deviceRef = Users.getRef().child('Usuarios/'+authData.uid);
      deviceRef.update({
        idDevice: "test123"
      });
    }
   };
   self.dataDevice = function(){
        var ref = new Firebase(FirebaseUrl);
        var devices = ref.child('Devices');
        var obj = $firebaseObject(ref);
        devices.on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          // key will be "fred" the first time and "barney" the second time
          var key = childSnapshot.key();
          // childData will be the actual contents of the child
          var childData = childSnapshot.val();
          self.histories.push({idDevice:childData.deviceId, power:childData.power, status: childData.status, hour: childData.timehour, date:childData.date});
        });
        obj.$loaded().then(function(){
          console.log("cargo");
        });
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
   };

})
.controller('ChartCtrl', function ($scope,FirebaseUrl,$firebaseObject) {
    var self = this;
    self.powers = [];
    self.dates = [];
    self.chartPower = function(){
        console.log("Grafica!!");
        var ref = new Firebase(FirebaseUrl);
        var devices = ref.child('Devices');
        var obj = $firebaseObject(ref);
        devices.on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          // key will be "fred" the first time and "barney" the second time
          var key = childSnapshot.key();
          // childData will be the actual contents of the child
          var childData = childSnapshot.val();
          self.powers.push(childData.power);
        });
        obj.$loaded().then(function(){
           console.log(self.powers);
           Highcharts.chart('container', {
            title: {
              text: 'Consumo energetico Anual',
              x: -20 //center
            },
            subtitle: {
                text: 'Fuente: senergy.com',
                x: -20
            },
            xAxis: {
            type: 'datetime',
                labels: {
                  formatter: function() {
                    return Highcharts.dateFormat('%H:%M:%S', this.value);
                  }
                }
            },
            yAxis: {
                title: {
                  text: 'Consumo (KW/h)'
                },
                  plotLines: [{
                  value: 0,
                  width: 1,
                  color: '#808080'
                }]
            },
            series: [{
                name: 'Consumo',
                data: self.powers
            }]
        });
        });
       
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
    };
})
.service('Users', function UserService(FirebaseUrl) {
    var ref = new Firebase(FirebaseUrl);
    this.save = function(user) {
      ref.child('Usuarios').child(user.uid).set(user);
    };
    this.getUser = function(){
      return ref.getAuth();
    }
    this.getRef = function(){
      return ref;
    }
})
.factory('Auth', function($firebaseAuth, FirebaseUrl){
    var ref = new Firebase(FirebaseUrl);
    var auth = $firebaseAuth(ref);
    return auth;
});