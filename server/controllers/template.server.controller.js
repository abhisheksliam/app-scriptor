'use strict';

const router = require('express').Router();
var Template     = require('./../models/app.server.models.template');
var Scenario     = require('./../models/app.server.models.scenario');
var Mapper     = require('./../models/app.server.models.mapper');

var scriptorController = require('../controllers/scriptor.server.controller');

exports.getTemplateBySkillId = function (req, res) {

    req.body.skill_id = "WD.Step.2.1.5";  // todo: temporary - remove it later
    Template.find({'skill_id': req.body.skill_id},function(err, template) {
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

exports.getScenarioByTaskId = function (req, res) {

    req.body.task_id = 'EXP16.WD.02.01.05.A1';  // todo: temporary - remove it later
    Scenario.find({'task_id': req.body.task_id},function(err, scenario) {
        if (err) {
            res.json({
                "errors": {
                    "errorMessage": err,
                    "errorCode": "PROCESSING_ERROR"
                }
            });
        }
        res.json(scenario);
    });
};

exports.getMapperByTemplatelId = function (req, res) {

    req.body.template_id = "WD.Step.2.1.5_1";  // todo: temporary - remove it later
    Mapper.find({'template_id': req.body.template_id},function(err, mapper) {
        if (err) {
            res.json({
                "errors": {
                    "errorMessage": err,
                    "errorCode": "PROCESSING_ERROR"
                }
            });
        }
        res.json(mapper);
    });
};

exports.getScriptByTaskId = function (req, res) {
    // todo
    /**
     * get script preq
     * check script type - step / task
     * merge files
     * return script json
     */

    // todo: update - temp
    req.body.task_id = 'EXP16.WD.02.01.05.A1';
    scriptorController.getTaskScript(req, res);
};
