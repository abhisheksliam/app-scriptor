'use strict';

/* dependencies */
const express = require('express');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const compress = require('compression');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');

// Error Handler
const appError = require('./server/error/apperror.server.service.js');

// Logger
const bunyan = require("bunyan");
const bunyanformat = require('bunyan-format');
const formatOut = bunyanformat({ outputMode: 'short' });
global.logger = bunyan.createLogger({name: 'SIM5Automation', stream: formatOut, level: 'info' });

//config
const config = require("./server/config");
var routes   = require('./server/routes/app.server.routes');

//session config
const session  = require('express-session');
const passport = require('passport');
/* Database connect */
var mongoose = require("mongoose");
var MongoStore = require('connect-mongo')(session);

//Express
let app = express();
/// passport config
require('./server/config/passport')(passport);

//-----------Express Middlewares-------------------
// 1. HTTP CACHE HEADERS
app.use(function(req, res, next) {

    if (req.url.match(/^\/(css|js)\/.+/)) {
        // set cacahe time in header as 3 days.
        res.setHeader('Cache-Control', 'public, max-age=259200');
        // while calculating the expiry date, add 3 days(change to milliseconds), in the current date.
        res.setHeader("Expires", new Date(Date.now() + 259200000).toUTCString());
    }
    return next();
});

//-----------CORS-------------------
app.use(function(req, res, next) {
    var allowedOrigins = ['http://apiui.herokuapp.com', 'https://apiui.herokuapp.com'];
    var origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    return next();
});

// 2. GZIP compression
app.use(compress());

//Default location of Express Views - used in development mode
let viewsPath = path.join(__dirname, '.tmp', 'views');

//process.env.NODE_ENV='development';

//Environment setup production / development
// Override Views location to dist folder
/*if (process.env.NODE_ENV === 'production') {
    viewsPath = path.join(__dirname, 'dist');
    app.use(express.static(__dirname + '/dist/'));
    app.set('views', viewsPath);
} else {*/
    // make express look in the public directory for assets (css/js/img)
    app.use(express.static(__dirname + '/.tmp/'));
    app.use(express.static(__dirname + '/app/'));
    app.set('views', viewsPath);
//}

// 3.Support for  json encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

//-----------Express WWW Server-------------------
let port = process.env.PORT || 3000;
// Serve Bower Components based JS & CSS & Image assets
app.use("/bower_components", express.static(__dirname + '/bower_components'));

// View engine setup (handlebars) based in viewsPath defined earlier
app.engine('.hbs', exphbs({
    defaultLayout: 'default',
    layoutsDir: viewsPath + '/layouts',
    partialsDir: viewsPath + '/partials',
    extname: '.hbs'
}));
app.set('view engine', '.hbs');
// CookieParser should be above session
app.use(cookieParser());


//-----------Connecting Mongo ------------------- // todo: synchronize mongo connection with app listen

var conn;
try{
    var mongoURL = config.mongo.prefix;
    if(config.mongo.username !== "") {
        mongoURL += config.mongo.username + ":" + config.mongo.password + "@";
    }
    mongoURL += config.mongo.dbURL;

    logger.info('Connecting to Mongo database : ' + mongoURL);
    mongoose.connect(mongoURL);

    conn = mongoose.connection;
    conn.on('error', console.error.bind(console, 'Mongo connection error:'));

    conn.once('open', function() {
        logger.info('Mongo Connection Successful');
    });
}catch(er){
    logger.error("Mongo error" + er);
}


// required for passport - session
app.use(session({
    secret: 'runner-v2',
    resave: true,
    key: 'runner.sid',
    saveUninitialized: true,
    cookie: {maxAge: ((60000 * 60 * 24)*7)},
    store: new MongoStore({mongooseConnection:conn})
} )); // session secret


app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use('/', routes.webrouter);
app.use('/api', routes.apirouter);

// error handling
app.use(function(err, req, res, next){
    logger.error(err);
    res.status(err.status || appError.ERROR_CODES.OTHER.httpCode)
        .send(err);
});

//-----------Start listening -------------------
app.listen(port, function() {
    logger.info('Your Automation App is running on http://localhost:' + port);
    logger.info('Environment is set to ' + (process.env.NODE_ENV || 'development'));
});
