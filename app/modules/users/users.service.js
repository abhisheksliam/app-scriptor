/**
 * Created by Shipra
 */
'use strict';

angular.module('automationApp.users')
.factory('usersService', ['$http', '$q', function($http, $q) {

    /***************** APIs ********************/

    var getUserDetails = function(username) {
        var userDetails = $http.get('/api/users/'+username);

        var deferred = $q.defer();
        deferred.resolve(userDetails);
        return deferred.promise;
    };

    var updateUserDetails = function(user) {
        var updateUser = $http.put('/api/users/' + user.username, {
            "password" : user.password,
            "name" : user.profile.name,
            "email" : user.profile.email,
            "svnusername" : user.profile.svn_credentials.username,
            "svnpassword" : user.profile.svn_credentials.password
        });

        var deferred = $q.defer();
        deferred.resolve(updateUser);
        return deferred.promise;
    };

    return {
        "getUserDetails": getUserDetails,
        "updateUserDetails": updateUserDetails
    };
}]);
