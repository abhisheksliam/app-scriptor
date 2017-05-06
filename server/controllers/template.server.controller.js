'use strict';

const router = require('express').Router();
var Template     = require('./../models/app.server.models.template');
var Scenario     = require('./../models/app.server.models.scenario');
var Mapper     = require('./../models/app.server.models.mapper');
var Locator     = require('./../models/app.server.models.locator');

var scriptorController = require('../controllers/scriptor.server.controller');

exports.getTemplateBySkillId = function (req, res) {
    req.params.skill_id = "sort_table_column";  // todo: temporary - remove it later
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

exports.getScenarioByTaskId = function (req, res) {

    req.params.task_id = 'EXP16.WD.02.01.05.A1';  // todo: temporary - remove it later
    Scenario.find({'task_id': req.params.task_id},function(err, scenario) {
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

    req.params.template_id = "WD.Step.2.1.5_1";  // todo: temporary - remove it later
    Mapper.find({'template_id': req.params.template_id},function(err, mapper) {
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

exports.getLocatorByKey = function (req, res) {

    req.params.app_type = "word";  // todo: temporary - remove it later
    req.params.element = "ribbon__hollow round bullet";  // todo: temporary - remove it later
    Locator.find({$and: [
        {'app_type': req.params.app_type},
        {'element': req.params.element}
    ]},function(err, locatorList) {
        if (err) {
            res.json({
                "errors": {
                    "errorMessage": err,
                    "errorCode": "PROCESSING_ERROR"
                }
            });
        }
        res.json(locatorList);
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
    req.params.task_id = 'SKL16.WD.01.01.02.A1';
    scriptorController.getTaskScript(req, res);
};