// console.log('home controller sourced');
// declare user roles
var guest = 1;
var user = 2;
var admin = 3;

var lock = new Auth0Lock('HHp6IJkxeJhf5IKHQ5NUAETGyq9ggCll', 'ben-mahowald.auth0.com');
// log out url, from Auth0
var logOutUrl = 'https://ben-mahowald.auth0.com/v2/logout';

myApp.controller('homeController', ['$scope', '$http', function($scope, $http){
  // console.log('in home controller');

  $scope.reports = [];
  $scope.clients = [];

  var emptyLocalStorage = function(){
    localStorage.removeItem( 'userProfile' );
    localStorage.removeItem( 'userToken' );
  }; // end emptyLocalStorage

  // uniquely identify user by emal
  var checkUser = function(profileEmail){
    // console.log('in checkUser');
    // get call to retrive clients from DB
    $http({
      method: 'GET',
      url: '/client',
    }).then(function(response) {
        var clients = response.data;
        // iterate over client emails and match with current user
        for (var i = 0; i < clients.length; i++) {
          if(profileEmail === clients[i].contact_email){
            console.log("there's a match in the database");
            // set match to manipulate DOM
            $scope.match = true;
            $scope.currentBus_id = clients[i]._id;
            return;
        }else{
            console.log('no match in the db');
            $scope.match = false;
        } // end else
        } // end for loop
        $scope.mapFunction();
      }, function(err) {
        console.log('error in retrieving clients:', err);
      }); // end then function
}; // end checkUser Function

  $scope.init = function(){
    // console.log( 'in init' );

    // check if a user's info is saved in localStorage
    if( JSON.parse( localStorage.getItem( 'userProfile' ) ) ){
      // if so, save userProfile as $scope.userProfile
      $scope.userProfile = JSON.parse( localStorage.getItem( 'userProfile' ) );
      console.log( 'loggedIn:', $scope.userProfile);
      $scope.showUser = true;
      checkUser($scope.userProfile.email);
    }
    else{
      // if not, make sure we are logged out and empty
      emptyLocalStorage();
      $scope.showUser = false;
      checkUser();
    }
  }; // end init function

// run init on controller load
$scope.init();

  // initialize map to show on load
  $scope.map = true;

  // button click events to show and hide map
  $scope.showMap = function (){
    $scope.map = true;
  }; // end showMap
  $scope.hideMap = function (){
    $scope.map = false;
  }; // end hideMap

  $scope.logIn = function(){
    // call out logIn function from auth0.js
    // console.log( 'in logIn' );
    lock.show( function( err, profile, token ) {
      if (err) {
        console.error( "auth error: ", err);
      } // end error
      else {
        // save token to localStorage
        localStorage.setItem( 'userToken', token );
        // save user profile to localStorage
        localStorage.setItem( 'userProfile', JSON.stringify( profile ) );
        // re-initialize to set dom view according to user
        $scope.init();
      } // end no error
    }); //end lock.show
  }; // end scope.logIn

  $scope.logOut = function(){
    // call our logOutUrl
    $http({
      method:'GET',
      url: logOutUrl,
    }).then( function( data ){
      // if logged out OK
      if( data.data == 'OK' ){
        // empty localStorage
        emptyLocalStorage();
        $scope.showUser = false;
        $scope.match = false;
      } // end if
    }); // end then
  }; // end scope.logOut

  //retrieves all reports and passes it to mapFunction
  $scope.getReports = function () {
    $http({
      method: 'GET',
      url: '/reports',
    }).then(function(response) {
      console.log(response.data);
      $scope.reports = response.data;
    }, function(err) {
      console.log('error in retrieving reports:', err);
    }); // end then function
  };

  $scope.getClients = function () {
    $http({
      method: 'GET',
      url: '/client',
    }).then(function(response) {
      console.log(response.data);
      $scope.clients = response.data;
    }, function(err) {
      console.log('error in retrieving clients:', err);
    }); // end then function
  };

  $scope.getReports();
  $scope.getClients();

///////////////////// Map /////////////////////////////////////
 $scope.mapFunction = function () {
  google.charts.load('upcoming', {packages: ['map']});
  google.charts.setOnLoadCallback(drawMap);
  console.log('clients -', $scope.clients);
  console.log('reports -', $scope.reports);
  $scope.getReports();
  $scope.getClients();
    function drawMap () {
      console.log('in drawmap');
      var data = new google.visualization.DataTable();
      data.addColumn('string', 'Address');
      data.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
      // loop through clients and add a point on map for each one
        for (var i = 0; i < $scope.clients.length; i++) {
          // loop through reports and match with client to display lastest portion and comment
          for (var j = 0; j < $scope.reports.length; j++) {
            // pull reports by client id
            if($scope.clients[i]._id === $scope.reports[j].bus_id){
              data.addRows([
                [$scope.clients[i].street + ', ' + $scope.clients[i].city + ', ' + $scope.clients[i].state + ', ' + $scope.clients[i].zip, createCustomHTMLContent($scope.clients[i].bus_name, $scope.clients[i].street, $scope.clients[i].city, $scope.clients[i].state, $scope.clients[i].zip, $scope.clients[i].pickup_time, $scope.reports[j].portions, $scope.reports[j].comment)],
              ]); // end addRows
            }
          } // end reports loop
        } // end clients loop

      var options = {
        mapType: 'styledMap',
        zoomLevel: 10,
        showTooltip: true,
        showInfoWindow: true,
        tooltip: {isHtml: true},
        maps: {
          MapOptions: {
            streetViewControl: false
          },
          styledMap: {
            name: 'Styled Map', // This name will be displayed in the map type control.
            styles: [
              {featureType: 'poi.attraction',
               stylers: [{color: '#fce8b2'}]
              },
              {featureType: 'road.highway',
               stylers: [{hue: '#0277bd'}, {saturation: -50}]
              },
              {featureType: 'road.highway',
               elementType: 'labels.icon',
               stylers: [{hue: '#000'}, {saturation: 100}, {lightness: 50}]
              },
              {featureType: 'landscape',
               stylers: [{hue: '#259b24'}, {saturation: 10}, {lightness: -22}]
              }
        ]}} // end maps in options
      }; // end options

      var map = new google.visualization.Map(document.getElementById('mapChart'));

      map.draw(data, options);

      function createCustomHTMLContent(name, street, city, state, zip, pickup_time, portions, comment) {
        return '<div class="infoPane">' + '<h3>' + name + '</h3><p>' + street + ', ' + city +
        ', ' + state + ', ' + zip + '.</p><p><span class="marker">Pickup Window: </span>' + pickup_time + '</p><p><span class="marker">Portions: </span>' + portions + '</p><p><span class="marker">Description: </span>' + comment + '</p></div>';
      } // end html content function
    } // end draw map function
    $scope.map = true;
  }; // end map function
  $scope.mapFunction();
}]); // end authController
