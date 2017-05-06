'use strict';

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

// define the schema for xpath model
var locatorSchema   = new Schema({
    'app_type': String,
    'element': String
});

module.exports = mongoose.model('Locator', locatorSchema, 'locators');