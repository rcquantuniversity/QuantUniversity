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

var cors = require('cors');
app.use(cors());

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var multer = require('multer');

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './private/services/uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + file.originalname.replace(/\..+$/, '') + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});

// var upload = multer({ storage : storage}).single('userPhoto');

var upload = multer({ storage : storage }).array('userPhoto',99);

/** API path that will upload the files */
app.post('/upload', function(req, res) {
    upload(req,res,function(err){
        if(err) {
            return res.end("Error uploading file.");
        }
        // res.end("File is uploaded");
        res.redirect('/#/instructor/listImages');
    });
});

// configure a public directory to host static content
app.use(express.static(__dirname + '/public'));

//require ("./public/app.js")(app);
require ("./private/app.js")(app);

var port = process.env.PORT || 3002;

app.listen(port);