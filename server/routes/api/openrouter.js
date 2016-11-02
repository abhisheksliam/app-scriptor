'use strict';
var express = require('express');
var xpathController = require('../../controllers/xpath.server.controller.js');

// Get the router
var openrouter = express.Router();

/**
 * Open Xpath get routes
 */

// get all xpath
openrouter.get('/xpaths', xpathController.getXpaths);

// get xpath for app_type
openrouter.get('/xpaths/:app_type', xpathController.getApplicationXpaths);

// get xpath: by key + app_type
openrouter.get('/xpaths/:app_type/:xpath_key', xpathController.getApplicationXpathValue);

module.exports = openrouter;
