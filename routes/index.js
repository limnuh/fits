var express = require('express');
var router = express.Router();
var rest = require('restler');
var mongoose = require('mongoose');
var config = require('../config/config');

/* GET home page. */
router.get('/', function (req, res, next) {

	// import places
	var auth = 'Basic ' + new Buffer(config.username + ':' + config.password).toString('base64');
	var message = '';

	rest.get(config.url + "/places", {
		headers: {
			"Accept": "application/vnd.cleveron+json; version=1.0",
			"Content-Type": "application/json",
			"Authorization": auth
		}
	}).on('2XX', function (data) {
		if (data.error) {
			message += "Error: " + data.error_message + "<br />";
		} else {
			var places = mongoose.model('Place');

			places.collection.drop();

			for (var i = 0; i < data.length; i++) {
				var place = data[i];
				places.create({
					name: place.name,
					place_id: place.place_id,
					group: place.group,
					address: place.address,
					open: place.open,
					findme: place.findme,
					lat: place.geolat,
					lng: place.geolng
				}, function (err, place) {
					if (err) {
						message += "There was a problem adding the information to the database." + "<br />";
						console.log(err);
					}
				});
			}
			message += (i + 1) + " places imported.";
		}
		res.render('index', {title: 'Fits test', message: message});
	});
});

module.exports = router;
