'use strict';

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

// define the schema for template model
var templateSchema   = new Schema({
    'skill_id': String
});

module.exports = mongoose.model('Template', templateSchema, 'template');