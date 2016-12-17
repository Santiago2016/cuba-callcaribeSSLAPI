var cors = require('cors')


const crypto = require('crypto'),
  fs = require("fs"),
  http = require("http"),
  https = require("https"),
  bodyParser  = require("body-parser"),
  methodOverride = require("method-override"),
  mysql = require('mysql');

var privateKey = fs.readFileSync('server.key').toString();
var certificate = fs.readFileSync('cuba.crt').toString();
var credentials = crypto.createCredentials({key: privateKey, cert: certificate});


var express = require("express"),
    app = express();



app.use(cors())
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var router = express.Router(),
    connection = mysql.createConnection({
	     host: 'localhost',
	     user: 'root',
	     password: 'admin',
	     database: 'mya2billing'
    });
    connection.connect();

    var userConnection = mysql.createConnection({
       host: 'localhost',
       user: 'root',
       password: 'admin',
       database: 'asterisk'
    });
    userConnection.connect();

router.get('/getCalls/:id',function(req,res){
   console.log("inside get calls",req.params);
   var id = req.params.id;
   connection.query('select starttime, stoptime, sessiontime, calledstation, sessionbill from cc_call where card_id = '+id+' and not sessiontime = 0;',function(err,rows,fields){
	if (err) {res.send(err)}
	else{res.send(rows)}
   })
})


router.post('/sendSMS',function(req,res){
   var toNumber = req.body.to
   var message = req.body.message
   var accountSid = 'AC3e2c6534a930f34fcaef2671724fcb59';
   var authToken = "fe699ececa7074cd1cf42050917d9063";
   var client = require('twilio')(accountSid, authToken);
   console.log(req.body);
   client.messages.create({
	body: message,
	to: toNumber,
	from:"+19543985604"
   }, function(err,sms){
	if (!err){
	    res.json({"message":"sms sent"});
	}
	else{
	    console.log(err);
	    res.json({"message":"error"});
	}
   })

})

router.get("/checkUser/:username",function(req,res){
  var username = req.params.username;
  var query = "select COUNT(id) from Users where username="+username+";"
  userConnection.query(query,function(err,rows,fields){
    console.log(err,rows,fields,query)
    res.send(rows);
  })

})

app.use(router);


https.createServer({
      key: privateKey,
      cert: certificate
    }, app).listen(8443);

