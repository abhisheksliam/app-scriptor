'use strict';

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

// define the schema for template model
var scenarioSchema   = new Schema({});

module.exports = mongoose.model('Scenario', scenarioSchema, 'scenarios');