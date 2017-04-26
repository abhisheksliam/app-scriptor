'use strict';

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

// define the schema for template model
var mapperSchema   = new Schema({});

module.exports = mongoose.model('Mapper', mapperSchema, 'mapper');