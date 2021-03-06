myApp.controller('accountController', ['$scope', '$http', function($scope, $http){

  // create account function
  $scope.submitAccount = function () {
    var userProfile = JSON.parse( localStorage.getItem( 'userProfile' ) );
    console.log('in submitAccount');
    var contactToSend = {
      bus_name: $scope.bus_name,
      bus_phone: $scope.bus_phone,
      bus_type: $scope.bus_type,
      pickup_time: $scope.pickup_time,
      contact_name: $scope.contact_name,
      contact_email: userProfile.email,
      city: $scope.city,
      state: $scope.state,
      street: $scope.street,
      zip: $scope.zip
    }; // end contact to send
    console.log('contactToSend', contactToSend);
    $http({
      method: 'POST',
      url: '/client',
      data: contactToSend
    }).then(function (response){
          console.log('http post /client success:', response);
        }, function (error) {
          console.log('error in post;', error);
        }); // end then function
    console.log(contactToSend);
    clearFields();
    window.location.href="#";
    $scope.showMap();
    location.reload();
  }; // end submitAccount function
  var clearFields = function() {
    $scope.bus_name = '';
    $scope.bus_phone = '';
    $scope.bus_type = '';
    $scope.contact_name = '';
    $scope.city = '';
    $scope.pickup_time = '';
    $scope.state = '';
    $scope.address = '';
    $scope.zip = '';
    google.charts.load("upcoming", {packages: ["map"]});
  }; // end clearFields
}]); // end createAcctController
