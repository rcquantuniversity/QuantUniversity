var express = require('express');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var nodemailer = require("nodemailer");

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
        cb(null, './private/services/temp/uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + file.originalname.replace(/\..+$/, '') + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});

// var storagePem = multer.diskStorage({ //multers disk storage settings
//     destination: function (req, file, cb) {
//         cb(null, './private/services/temp/uploads/pem/')
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + file.originalname.replace(/\..+$/, '') + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
//     }
// });

// var upload = multer({ storage : storage}).single('userPhoto');

var upload = multer({ storage : storage }).array('userPhoto',99);

// var uploadPem = multer({ storage : storagePem }).single('pemFile');

/** API path that will upload the files */
app.post('/upload', function(req, res) {
    upload(req,res,function(err){
        if(err) {
            return res.end("Error uploading file.");
        }
        console.log("file name is: "+req.body.filename);
        res.sendStatus(200);
        // res.end("File is uploaded");
        // res.redirect('/#/instructor/listImages');
    });
});

// app.post('/uploadPem', function(req, res) {
//     uploadPem(req,res,function(err){
//         if(err) {
//             return res.end("Error uploading file.");
//         }
//         // res.end("File is uploaded");
//         res.redirect('/#/student/profile');
//     });
// });

var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: "ar.adaptivealgo@gmail.com",
        pass: process.env.PASSWORD
    }
});

app.get('/send',function(req,res){
    var mailOptions={
        to : req.query.to,
        subject : 'Your details are updated!',
        // text : req.query.text
        html:  req.query.message
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            res.end("error");
        }   else{
            console.log("Message sent: " + response.message);
            res.end("sent");
        }
    });
});

app.get('/sendToAdmin',function(req,res){
    var mailOptionsAdmin={
        to : req.query.to,
        subject : 'You have updated the details!',
        // text : req.query.text
        html:  req.query.message
    }
    console.log(mailOptionsAdmin);
    smtpTransport.sendMail(mailOptionsAdmin, function(error, response){
        if(error){
            console.log(error);
            res.end("error");
        }   else{
            console.log("Message sent: " + response.message);
            res.end("sent");
        }
    });
});

// configure a public directory to host static content
app.use(express.static(__dirname + '/public'));

//require ("./public/app.js")(app);
require ("./private/app.js")(app);

var port = process.env.PORT || 3002;

app.listen(port);