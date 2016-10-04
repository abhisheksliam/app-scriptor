/**
 * Created by Shipra on 3/14/2016.
 */
'use strict';

const TEMPLATE_BLANK = "blank",
      TEMPLATE_BALOO = "baloo",
      TEMPLATE_TASK = "task",
      TEMPLATE_INGEST = "ingest",
      BALOO_API_HOST = 'loadrunner1',
      BALOO_API_PORT = '8080',
      BALOO_API_URL = '/NLPService/api/tasks/';

const router = require('express').Router();
var http = require('http');
var AutomationScripts     = require('./../models/app.server.models.script');
const converterService = require("./../services/converter.server.service");

exports.saveTask = function (req, res) {
    AutomationScripts.findOne({task_id: req.body.task_id}, function(err, scriptData) {
        if (err) {
            res.json({
            "errors": {
                "errorMessage": err,
                "errorCode": "PROCESSING_ERROR"
            }
            });
        }
        if(scriptData) {
            res.json({ "errors": {
                "errorMessage": "Task script already exists in database",
                "errorCode": "EXISTS_IN_DB"
            } });
        } else {
             checkForTemplateAndSave(req, res, true);
        }
    });

};

exports.updateTask = function (req, res) {
    checkForTemplateAndSave(req, res, false);
};

/**
 * Return complete task json
 * @param req
 * @param res
 */
exports.getTaskScript = function (req, res) {
    AutomationScripts.find({task_id: req.params.task_id}, function(err, scriptData) {
        if (err) {
            res.json({
                "errors": {
                    "errorMessage": err,
                    "errorCode": "PROCESSING_ERROR"
                }
            });
        }

        if(scriptData.length !== 0) {
            var scriptData = scriptData[0];

            if(req.query.format === 'json' || req.query.format === 'xml' || req.query.format === 'java') {

                if(req.query.format === 'json') {
                    res.json(scriptData);
                } else if(req.query.format === 'xml') {
                    var xmlContent = converterService.jsonToDistXml(scriptData);
                    res.set('Content-Type', 'text/xml');
                    res.send(xmlContent);
                } else if(req.query.format === 'java') {
                    var javaContent = converterService.jsonToDistJava(scriptData);
                    res.json(javaContent);
                }

            } else {
                if(scriptData.task_json[1] !== undefined){
                    scriptData = converterService.transformPathwaysNewFormat(scriptData);
                }

                res.json(scriptData);
            }
        } else {
            res.json({ "errors": {
                "errorMessage": 'TASK_NOT_FOUND : ' + req.params.task_id,
                "errorCode": "TASK_NOT_FOUND"
            } });
        }
    });
};

exports.updateTaskScript = function (req, res) {

    var scriptData = converterService.transformPathwaysOldFormat(req.body.task_json);

    AutomationScripts.findOneAndUpdate({task_id: req.params.task_id}, {$set: {"task_json" : req.body.task_json, 'modified_by.name' : req.body.modified_by.name}}, function(err, doc){
        if (err) {
            res.json({
                "errors": {
                    "errorMessage": err,
                    "errorCode": "PROCESSING_ERROR"
                }
            });
        }
        res.json(doc);
    });
};

exports.getAllTasks = function (req, res) {
    AutomationScripts.find(function(err, scriptData) {
        if (err) {
            res.json({
                "errors": {
                    "errorMessage": err,
                    "errorCode": "PROCESSING_ERROR"
                }
            });
        }
        res.json(scriptData);
    });
};

exports.deleteTaskScript = function (req, res) {
    AutomationScripts.remove({
        task_id: req.params.task_id
    }, function(err, scriptData) {
        if (err) {
            res.json({
                "errors": {
                    "errorMessage": err,
                    "errorCode": "PROCESSING_ERROR"
                }
            });
        }

        res.json({ message: 'Successfully deleted task json!' });
    });
};

function checkForTemplateAndSave(req, res, bSaveUpdate){
    var automationScript = new AutomationScripts();
    // Set text and user values from the request
    automationScript.task_id = req.body.task_id;
    automationScript.modified_by.name = req.body.modified_by.name;

    if(req.body.template === TEMPLATE_BLANK) {
        generateBlankTemplate(req, function(taskJson){
            saveUpdateData(bSaveUpdate, req, res, automationScript, taskJson);
        });

    } else if(req.body.template === TEMPLATE_BALOO){
        generatePreFilledBalooTemplate(req,
            function(taskJson){
                saveUpdateData(bSaveUpdate, req, res, automationScript, taskJson);
            });

    } else if (req.body.template === TEMPLATE_TASK){
        generateCopyTemplate(req, function(taskJson){
            saveUpdateData(bSaveUpdate, req, res, automationScript, taskJson);
        });
    } else if (req.body.template === TEMPLATE_INGEST){
        saveUpdateData(bSaveUpdate, req, res, automationScript, req.body.ingest_json);
    }
};

function saveUpdateData(bSaveUpdate, req, res, automationScript, taskJson){
    automationScript.task_json = taskJson;

    if (taskJson.errors){
        console.log(taskJson);
        res.json(taskJson);
    }
    else if(bSaveUpdate) {
        // save as a new task - this is already validated that task does not exist.
        automationScript.created_by.name = req.body.modified_by.name;
        automationScript.save(function (err, scriptData) {
            if (err) {
                res.json({
                    "errors": {
                        "errorMessage": err,
                        "errorCode": "PROCESSING_ERROR"
                    }
                });
            }

            if(scriptData) {
                if (req.body.template === TEMPLATE_TASK || req.body.template === TEMPLATE_INGEST){
                    var scriptData = converterService.transformPathwaysNewFormat(scriptData);
                    res.json(scriptData);
                } else {
                    res.json(scriptData);
                }
            } else {
                res.json({ "errors": {
                    "errorMessage": 'TASK_NOT_FOUND : ' + req.body.task_id,
                    "errorCode": "TASK_NOT_FOUND"
                } });
            }
        });
    } else {
        AutomationScripts.findOneAndUpdate({task_id: req.body.task_id}, {$set: {"task_json" : automationScript.task_json, 'modified_by.name' : req.body.modified_by.name}}, function(err, doc){

            if (err) {
                res.json({
                    "errors": {
                        "errorMessage": err,
                        "errorCode": "PROCESSING_ERROR"
                    }
                });
            }

            doc.modified_by.name = automationScript.modified_by.name;
            doc.task_json = automationScript.task_json;

            if(doc.task_json.length !== 0) {
                if(req.body.template === TEMPLATE_TASK) {
                    var scriptData = converterService.transformPathwaysNewFormat(doc);
                    res.json(scriptData);
                } else {
                    res.json(doc);
                }
            } else {
                res.json({ "errors": {
                    "errorMessage": 'TASK_NOT_FOUND : ' + req.body.task_id,
                    "errorCode": "TASK_NOT_FOUND"
                } });
            }
        });
    }
};

function generateBlankTemplate(req, done){

    var taskjson = [
        {
            "items": [
                {
                    "methods": [
                        {
                            "type": "Ribbon",
                            "actions": []
                        }
                    ]
                }
            ],
            "appName" : req.body.app_key,
            "id" : req.body.sle_id,
            "scenario" : req.body.scenario
        }
    ];

    done(taskjson);
}


function generatePreFilledBalooTemplate(req,done){

    var errObj = {
                "errors": {
                    "errorMessage": '',
                    "errorCode": "PROCESSING_ERROR"
                }
                };

    var _v1 = (BALOO_API_URL + req.body.task_id);

    var options = {
        host: BALOO_API_HOST,
        port: BALOO_API_PORT,
        path: _v1,
        method: 'get'
    };

    var callback = function(response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('error', function(err) {
            errObj.errors.errorMessage = err;
            done(errObj);
        });

        response.on('end', function () {
            var parsed = {};
            try{
                parsed = JSON.parse(str);
                if(parsed.statusCode == 200){
                    parsed.content.appName = req.body.app_key;
                    done([parsed.content]);
                } else {
                    errObj.errors.errorMessage = parsed.message;
                    done(errObj);
                }
            } catch(e){
                errObj.errors.errorMessage = "Error in NLP JSON";
                done(errObj);
            }
        });
    };

        var b_req = http.request(options, callback);
        b_req.on('error', function(err) {
                errObj.errors.errorMessage = 'Error in connecting NLP server';
                done(errObj);
            });
        b_req.end();
};

function generateCopyTemplate(req, done){

    AutomationScripts.findOne({task_id: req.body.copy_task_id}, function(err, scriptData) {
        if (err) {
            var error = {
                "errors": {
                    "errorMessage": err,
                    "errorCode": "PROCESSING_ERROR"
                }
            };
            done(error);
        }
        if(scriptData) {
            scriptData.task_json[0].appName = req.body.app_key;
            scriptData.task_json[0].id =req.body.sle_id;
            scriptData.task_json[0].scenario = req.body.scenario;

            done(scriptData.task_json);
        } else {
            var error = {
                "errors": {
                    "errorMessage": 'TASK_NOT_FOUND : ' + req.body.copy_task_id,
                    "errorCode": 'TASK_NOT_FOUND'
                }
            };
            done(error);
        }
    });
};