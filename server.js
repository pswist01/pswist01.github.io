// Initialization
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var validator = require('validator'); // See documentation at https://github.com/chriso/validator.js
var app = express();
var http = require('http');
// See https://stackoverflow.com/questions/5710358/how-to-get-post-query-in-express-node-js
app.use(bodyParser.json());
// See https://stackoverflow.com/questions/25471856/express-throws-error-as-body-parser-deprecated-undefined-extended
app.use(bodyParser.urlencoded({ extended: true }));

// Mongo initialization
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/comp20';
var mongo = require('mongodb');
var db = mongo.Db.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
});

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

app.post('/sendLocation', function(request, response) {
	var login = request.body.login;
        var lat = request.body.lat;
        var lng = request.body.lng;
        var created_at = new Date();

	var toInsert = {
		"login": login,
	        "lat": parseFloat(lat),
	        "lng": parseFloat(lng),
	        "created_at": created_at
	};
	db.collection('locations', function(er, collection) {
		var id = collection.insert(toInsert, function(err, saved) {
			if (err) {
				response.send(500);
			}
			else {
			    db.collection('locations', function(er, collection) {
				collection.find().limit(100).sort({"created_at":-1}).toArray(function(err, cursor) {
				    if (!err) {
					response.send(JSON.stringify({"characters": [], "students":cursor}));
				    } else {
					response.send(500);
				    }
				});
			    });
			    
			}
		});
	});
});		



app.get('/', function(request, response) {
	response.set('Content-Type', 'text/html');
	var indexPage = '';
	db.collection('locations', function(er, collection) {
		collection.find().sort({"created_at":-1}).toArray(function(err, cursor) {
			if (!err) {
				indexPage += "<!DOCTYPE HTML><html><head><title>Locations</title></head><body><h1>Locations</h1>";
				for (var count = 0; count < cursor.length; count++) {
					indexPage += "<p>" + cursor[count].login + " " + cursor[count].lat + " " + cursor[count].lng + " " + cursor[count].created_at + "</p>";
				}
				indexPage += "</body></html>"
				response.send(indexPage);
			} else {
				response.send(500);
			}
		});
	});
});


app.get('/locations.json', function(request, response) {
	var indexPage = '';
        var login = request.query.login;
    if (login == undefined)
	response.send("[]");
    else {
	db.collection('locations', function(er, collection) {
		collection.find({"login":login}).sort({"created_at":-1}).toArray(function(err, cursor) {
			if (!err) {
			    response.send(cursor);
			} else {
				response.send(500);
			}
		});
	});
    }
});

app.get('/redline.json', function(request, response) {
var options = {
  host: 'developer.mbta.com',
  port: 80,
  path: '/lib/rthr/red.json'
};
    
    http.get(options, function(rawreq) {
	var data = '';
	console.log("Got response: " + rawreq.statusCode);
	// Okay, we got some data.  Data is piece-mailed!  That is, you will not get all the data in one swoop!
	rawreq.on('data', function(chunk) {
	    data += chunk;
	});
	
	// So we finished getting all the data (think of this as readyState = 4), now we can send response data safely!
	rawreq.on('end', function() {
	    response.send(data);
	});
    }).on('error', function(e) {
	console.log("Got error: " + e.message);
    });
});

// Oh joy! http://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
app.listen(process.env.PORT || 3000);
