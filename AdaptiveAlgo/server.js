var express = require('express');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var app = express();

app.use(session({
    secret : 'this is the secret',
    resave : true,
    saveUninitialized : true
}));

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// configure a public directory to host static content
app.use(express.static(__dirname + '/public'));

//require ("./public/app.js")(app);
require ("./private/app.js")(app);

var port = process.env.PORT || 3002;

app.listen(port);