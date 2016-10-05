/**
 * Created by AbhishekK
 */
'use strict';

const router = require('express').Router();
const config = require("./../config");
var Users = require('./../models/app.server.models.user');
var AutomationScripts = require('./../models/app.server.models.script');
var Client = require('svn-spawn');
var converterService = require('./../services/converter.server.service')
var fs = require('fs');
var mkdirp = require('mkdirp');

var getSvnCredentials = function(username, callback){
    console.log('getting svn user details details from db');
    console.log(username);
    Users.findOne({'username': username}, function(err, user) {
        if(user){
            console.log('user found');
            callback(user.profile.svn_credentials);
        } else {
            console.log('user not found');
            callback(null);
        }
    });
};

function commitFileToSvn(taskid, user, pass, svnUrl, app, res, success, err){
    // todo: get file paths
    var _filename = (taskid).replace(/\./gi, "_").trim();
    var autoFilePath = getDirFromXMlName(_filename);

    var javaFilePath = '/src/test/java/testcase/' + app + '/'+ 'Test_' + _filename + '.java';
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
            console.log( "svn" );
            var scriptData = scriptData[0];
            var xmlContent = converterService.jsonToDistXml(scriptData);
            var javaContent = converterService.jsonToDistJava(scriptData);

            /**
             * commiting files to svn
             * todo: add to queue here & pop one by one
             * todo: change this to commit files from stream to svn url
             */

            var client = new Client({
                cwd: (_serverDirectory + '/server/lib'),
                username: user, // optional if authentication not required or is already saved
                password: pass, // optional if authentication not required or is already saved
                noAuthCache: true // optional, if true, username does not become the logged in user on the machine
            });

            client.cmd(['cleanup'], function(err, data) {
                if (err) {
                    res.json(
                        {
                            error:"true",
                            msg:"Error in SVN cleanup"
                        }
                    )
                } else {
                    client.update(function(err, data) {
                        if(err){
                            console.log('svn update error');
                            // todo: add command to cleanup and retry commit
                        }
                        writeCommitFile(_filename,app,javaContent,xmlContent,
                            function(){

                                var otherCompleted = false;
                                var commiterr = false;
                                /**
                                 * Commiting java
                                 */
                                client.commit(['SIMS-0000', (_serverDirectory + '/server/lib' + javaFilePath)], function(err, data) {
                                    if (err) {
                                        client.add(_serverDirectory + '/server/lib' + javaFilePath, function(err, data) {
                                            if (err) {
                                                if(otherCompleted) {
                                                    res.json(
                                                        {
                                                            error:"true",
                                                            msg:"Error in commiting files"
                                                        }
                                                    )
                                                } else {otherCompleted = true;commiterr=true;}
                                            } else {
                                                client.commit(['SIMS-0000', (_serverDirectory + '/server/lib' + javaFilePath)], function(err, data) {
                                                    if (err) {
                                                        if(otherCompleted) {
                                                            res.json(
                                                                {
                                                                    error:"true",
                                                                    msg:"Error in commiting files"
                                                                }
                                                            )
                                                        } else {otherCompleted = true;commiterr=true;}
                                                    }
                                                    if(otherCompleted && (!commiterr)) {
                                                        res.json(
                                                            {
                                                                error:"false",
                                                                msg:"Files commited successfully"
                                                            }
                                                        )
                                                    } else if(otherCompleted && commiterr) {
                                                        res.json(
                                                            {
                                                                error:"true",
                                                                msg:"Error in commiting files"
                                                            }
                                                        )
                                                    } else {otherCompleted = true;}
                                                });
                                            }

                                        });
                                    } else {
                                        if(otherCompleted && (!commiterr)) {
                                            res.json(
                                                {
                                                    error:"false",
                                                    msg:"Files commited successfully"
                                                }
                                            )
                                        } else if(otherCompleted && commiterr) {
                                            res.json(
                                                {
                                                    error:"true",
                                                    msg:"Error in commiting files"
                                                }
                                            )
                                        } else {otherCompleted = true;}
                                    }

                                });

                                /**
                                 * Commiting XML
                                 */
                                client.commit(['SIMS-0000', (_serverDirectory + '/server/lib' + xmlFilePath)], function(err, data) {
                                    if (err) {
                                        client.add(_serverDirectory + '/server/lib' + xmlFilePath, function(err, data) {
                                            if (err) {
                                                if(otherCompleted) {
                                                    res.json(
                                                        {
                                                            error:"true",
                                                            msg:"Error in commiting files"
                                                        }
                                                    )
                                                } else {otherCompleted = true;commiterr=true;}
                                            } else {
                                                client.commit(['SIMS-0000', (_serverDirectory + '/server/lib' + xmlFilePath)], function(err, data) {
                                                    if (err) {
                                                        if(otherCompleted) {
                                                            res.json(
                                                                {
                                                                    error:"true",
                                                                    msg:"Error in commiting files"
                                                                }
                                                            )
                                                        } else {otherCompleted = true;commiterr=true;}
                                                    }
                                                    if(otherCompleted && (!commiterr)) {
                                                        res.json(
                                                            {
                                                                error:"false",
                                                                msg:"Files commited successfully"
                                                            }
                                                        )
                                                    } else if(otherCompleted && commiterr) {
                                                        res.json(
                                                            {
                                                                error:"true",
                                                                msg:"Error in commiting files"
                                                            }
                                                        )
                                                    } else {otherCompleted = true;}
                                                });
                                            }
                                        });
                                    } else {
                                        if(otherCompleted && (!commiterr)) {
                                            res.json(
                                                {
                                                    error:"false",
                                                    msg:"Files commited successfully"
                                                }
                                            )
                                        } else if(otherCompleted && commiterr) {
                                            res.json(
                                                {
                                                    error:"true",
                                                    msg:"Error in commiting files"
                                                }
                                            )
                                        } else {otherCompleted = true;}
                                    }

                                });

                            },
                            function(){
                                console.log('write file err!');
                                res.json(
                                    {
                                        error:"true",
                                        msg:"Error in writing files"
                                    }
                                )
                            });

                    });
                }
            });

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
    console.log(req.body);

    var taskid = req.body.task_id + '.' + req.body.scenario;
    // 1
    getSvnCredentials(req.body.username,function(svnuser){
        if(svnuser == null) {
            console.log("Error in getting user svn credentials");
            res.json(
                {
                    error:"true",
                    msg:"Error in getting user svn credentials"
                }
            );
        } else {
            var user = svnuser.username, pass = svnuser.password, app = req.body.appname;
            //var user = 'manish.mehta', pass = 'manish', app = req.body.appname;
            // 2
            var svnUrl = config.svn.url;
            // 3

            commitFileToSvn(taskid, user, pass, svnUrl, app, res,
            function(success){ // success
                console.log("Files commited successfully");
                res.json(
                    {
                        error:"false",
                        msg:"Files commited successfully"
                    }
                );
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
};


function writeCommitFile(filename,appName,java,xml,done, err){

    var _taskXmlPath = getDirFromXMlName(filename);

    var xmlDirectory = (_serverDirectory + "/server/lib/src/test/resources/taskXML" + _taskXmlPath);
    var xmlfilepath = xmlDirectory + "/" + filename + '.xml';

    var javaDirectory = (_serverDirectory+"/server/lib/src/test/java/testcase/"+appName);
    var javafilepath = (_serverDirectory+"/server/lib/src/test/java/testcase/"+appName + "/Test_" + filename + '.java');

    console.log('creating dir.. '+ xmlDirectory);
    mkdirp(xmlDirectory, function (err) {
        if (err) console.error(err)
        else {
            mkdirp(javaDirectory, function (err) {
                if (err) console.error(err)
                else {
                    writeFilesToDisk (xmlfilepath,xml,javafilepath,java);
                }
            });
        }
    });

    function writeFilesToDisk( xmlfilepath, xml, javafilepath, java ){

        var otherCompleted = false;
        fs.writeFile( xmlfilepath, xml, function(error) {
            if (error) {
                err("write error:  " + error.message);
                console.error("write error:  " + error.message);
            } else {
                if(otherCompleted) {
                    done();
                } else {
                    otherCompleted = true;
                }
                console.log("Successful Write to " + xmlfilepath);
            }
        });

        fs.writeFile( javafilepath, java, function(error) {
            if (error) {
                err("write error:  " + error.message);
                console.error("write error:  " + error.message);
            } else {
                if(otherCompleted) {
                    done();
                } else {
                    otherCompleted = true;
                }
                console.log("Successful Write to " + javafilepath);
            }
        });
    };
    console.log('writing.. '+ filename);
};


function getDirFromXMlName (taskXMLName){

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