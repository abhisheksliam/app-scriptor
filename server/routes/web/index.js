'use strict';
var express = require('express');

var webrouter = express.Router();

webrouter.use('/', function (req, res, next) {
    next();
    if (req.url === '/' || req.url === '/api/login' || req.url === '/api/logout' || ((req.url.indexOf('/api/xpaths') !== -1) && (req.method === 'GET')) || req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
});

webrouter.get('/', function (req, res) {
    res.render('index', {
        user: req.user || null,
        helpers: {
            json: function (context) {
                return JSON.stringify(context);
            }
        }
    });
});

module.exports = webrouter;

