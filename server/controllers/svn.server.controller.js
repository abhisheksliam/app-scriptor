/**
 * Created by AbhishekK
 */
'use strict';

const router = require('express').Router();
const config = require("./../config");
var Users = require('./../models/app.server.models.user');
var AutomationScripts = require('./../models/app.server.models.script');

var getSvnCredentials = function(username, callback){
    console.log('getting google user details from db');
    Users.findOne({'username': username}, function(err, user) {
        if(user){
            callback(user.svn_credentials);
        } else {
            callback(null);
        }
    });
};

var getDirFromXMlName = function(taskXMLName){

    var folderNames = taskXMLName.split("_");

    if(folderNames.length == 6)
    {
        var dirName = "";
        dirName = "/" + folderNames[0] + "/" + folderNames[1] + "/" + folderNames[2] + "/";
        var tmpFolderName = folderNames[0] + "_" + folderNames[1] + "_" + folderNames[2] + "_";
        dirName = dirName + taskXMLName.replace(new RegExp(tmpFolderName, 'g'), '').replace(new RegExp('_', 'g'), '.').replace(new RegExp('.xml', 'g'), '');

        console.log('dirName: ' + dirName);
        return dirName;

    }
    else {
        return null;
    }
};

function commitFileToSvn(taskid, user, pass, svnUrl, app, res, success, err){
    // todo: get file paths
    var _filename = (taskid).replace(/\./gi, "_").trim();
    var autoFilePath = getDirFromXMlName(_filename);

    var javaFilePath = '/src/test/java/testcase/' + app + 'Test_' + _filename + '.java';
    var jsonFilePath = '/src/test/resources/taskJSON' + autoFilePath + '/' + _filename + '.json';
    var xmlFilePath = '/src/test/resources/taskXML' + autoFilePath + '/' + _filename + '.xml';

    // get file data
    AutomationScripts.find({task_id: taskid}, function(err, scriptData) {
        if (err) {
            res.json(
                {
                    error:"true",
                    msg: "Error in getting taskdata" + err
                }
            );
        }

        if(scriptData.length !== 0) {
            var scriptData = scriptData[0];
            var xmlContent = converterService.jsonToDistXml(scriptData);
            var javaContent = converterService.jsonToDistJava(scriptData);

            //todo: use svn plugin to commit

        } else {
            res.json(
                {
                    error:"true",
                    msg: "Task not found in database"
                }
            );
        }
    });

};

exports.publishTask = function (req, res) {

    var taskid = req.body.task_id + '.' + req.body.scenario;
    // 1
    getSvnCredentials(req.body.username,function(svnuser){
        if(svnuser == null) {
            res.json(
                {
                    error:"true",
                    msg:"Error in getting user svn credentials"
                }
            );
        } else {
            var user = svnuser.username, pass = svnuser.password, app = req.body.appname;
            // 2
            var svnUrl = config.svn.url;
            // 3

            commitFileToSvn(taskid, user, pass, svnUrl, app, res,
            function(success){ // success

            },function(err){ // failure
                    res.json(
                        {
                            error:"true",
                            msg:"Error in pushing files to svn"
                        }
                    );
            });
        }
    });
    /**
     * Server Side:
     3. User SVN credentials gathered from corresponding user model data from database (user svn credentials will be stored in database)
     {
         "_id": {
             "$oid": "57c68fe2dcba0f63c1cef81d"
         },
         "username": "abhishek",
         "password": "password",
         "salt": "",
         "profile": {
             "name": "Abhishek",
             "email": "abhishek.kumar@comprotechnologies.com",
     "selenium": {},
     "svn_credentials": {
		    "username": "abhishek",
			"password": "password",
		}
     }
     }

     4. SVN base url is fetched from scriptor server environment variable file
     var config= {
    mongo:{
        "prefix": "mongodb://",
        "dbURL": "ds023674.mlab.com:23674/runnerv2",
        "username": "root",
        "password": "admin"
    },
    svn: {
        url:""
    }
};

     5. Relative filepath generated for Java, xml, json
     6. File Content generated for Java, xml, json from server controllers
     7. SVN Commit Queue is created and Comnmit request is added to queue. (To handle multiple user commiting simultaneously)
     8. Success and error messages will be sent back to user.
     */

};
