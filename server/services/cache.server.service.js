'use strict';
var redis = require('redis');
var client = redis.createClient();

client.on('connect', function() {
    console.log('Redis Connected');
});

exports.setCacheObject = function (key, data) {

    console.log('setting cache for ' + key);

    client.set(key , data);
    client.expire(key, 3600); // in seconds
};


exports.getCacheObject = function (key, done) {

    var _query = ( key == undefined || null ? '' : key );

    console.log('getting cache for ' + _query);

    client.get(_query , function(err, object) {

        if(object) {
            done(JSON.parse(object));
        } else {
            done(object);
        }
    });
};
