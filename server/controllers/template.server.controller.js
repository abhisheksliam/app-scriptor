'use strict';

const router = require('express').Router();
var Template     = require('./../models/app.server.models.template');

exports.getTemplateBySkillId = function (req, res) {

    Template.find({'skill_id': req.params.skill_id},function(err, template) {
        if (err) {
            res.json({
                "errors": {
                    "errorMessage": err,
                    "errorCode": "PROCESSING_ERROR"
                }
            });
        }
        res.json(template);
    });
};
