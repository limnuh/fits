var express = require('express'),
		router = express.Router(),
		mongoose = require('mongoose'),
		bodyParser = require('body-parser'), //parses information from POST
		methodOverride = require('method-override'); //used to manipulate POST

router.use(bodyParser.urlencoded({extended: true}));
router.use(methodOverride(function (req, res) {
	if (req.body && typeof req.body === 'object' && '_method' in req.body) {
		// look in urlencoded POST bodies and delete it
		var method = req.body._method;
		delete req.body._method;
		return method;
	}
}));

//build the REST operations at the base for places
//this will be accessible from http://127.0.0.1:3000/places if the default route for / is left unchanged
router.route('/')
		.get(function (req, res, next) {
			//retrieve all places from Monogo
			mongoose.model('Place').find({}, function (err, places) {
				if (err) {
					return console.error(err);
				} else {
					//respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
					res.format({
						//HTML response will render the index.jade file in the views/places folder. We are also setting "places" to be an accessible variable in our jade view
						html: function () {
							res.render('places/index', {
								title: 'All Places',
								"places": places
							});
						},
						//JSON response will show all places in JSON format
						json: function () {
							res.json(places);
						}
					});
				}
			});
		})
		//POST a new place
		.post(function (req, res) {
			var form = formValidation(req.body);;
			if(form.isInvalid) {
				res.format({
					//HTML response will render the index.jade file in the views/places folder. We are also setting "places" to be an accessible variable in our jade view
					html: function () {
						res.render('places/error', {
							title: 'Form validation error',
							"message": form.message
						});
					},
					//JSON response will show all places in JSON format
					json: function () {
						res.json(places);
					}
				});
			} else {
				//call the create function for our database
				mongoose.model('Place').create({
					name: req.body.name,
					place_id: req.body.place_id,
					group: req.body.group,
					address: req.body.address,
					open: req.body.open,
					findme: req.body.findme,
					lat: req.body.lat,
					lng: req.body.lng
				}, function (err, place) {
					if (err) {
						res.send("There was a problem adding the information to the database.");
					} else {
						//place has been created
						console.log('POST creating new place: ' + place);
						res.format({
							//HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
							html: function () {
								// If it worked, set the header so the address bar doesn't still say /adduser
								res.location("places");
								// And forward to success page
								res.redirect("/places");
							},
							//JSON response will show the newly created place
							json: function () {
								res.json(place);
							}
						});
					}
				});
			}
		});

/* GET New Place page. */
router.get('/new', function (req, res) {
	res.render('places/new', {title: 'Add New Place'});
});

router.route('/:id').get(function (req, res) {
	mongoose.model('Place').findById(req.params.id, function (err, place) {
		if (err) {
			console.log('GET Error: There was a problem retrieving: ' + err);
		} else {
			console.log('GET Retrieving ID: ' + place._id);
			res.format({
				html: function () {
					res.render('places/show', {"place": place});
				},
				json: function () {
					res.json(place);
				}
			});
		}
	});
});

//GET the individual place by Mongo ID
router.get('/:id/edit', function (req, res) {
	//search for the place within Mongo
	mongoose.model('Place').findById(req.params.id, function (err, place) {
		if (err) {
			console.log('GET Error: There was a problem retrieving: ' + err);
		} else {
			//Return the place
			console.log('GET Retrieving ID: ' + place._id);
			res.format({
				//HTML response will render the 'edit.jade' template
				html: function () {
					res.render('places/edit', {
						title: 'Place' + place._id,
						"place": place
					});
				},
				//JSON response will return the JSON output
				json: function () {
					res.json(place);
				}
			});
		}
	});
});

//PUT to update a place by ID
router.put('/:id/edit', function (req, res) {
	//find the document by ID
	mongoose.model('Place').findById(req.params.id, function (err, place) {
		//update it
		place.update({
			name: req.body.name,
			address: req.body.address,
			group: req.body.group,
			open: req.body.open,
			findme: req.body.findme,
			lat: req.body.lat,
			lng: req.body.lng
		}, function (err, placeID) {
			if (err) {
				res.send("There was a problem updating the information to the database: " + err);
			}
			else {
				//HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
				res.format({
					html: function () {
						res.redirect("/places/" + place._id);
					},
					//JSON responds showing the updated values
					json: function () {
						res.json(place);
					}
				});
			}
		});
	});
});

//DELETE a Place by ID
router.delete('/:id/edit', function (req, res) {
	//find place by ID
	mongoose.model('Place').findById(req.params.id, function (err, place) {
		if (err) {
			return console.error(err);
		} else {
			//remove it from Mongo
			place.remove(function (err, place) {
				if (err) {
					return console.error(err);
				} else {
					//Returning success messages saying it was deleted
					console.log('DELETE removing ID: ' + place._id);
					res.format({
						//HTML returns us back to the main page, or you can create a success page
						html: function () {
							res.redirect("/places");
						},
						//JSON returns the item with the message that is has been deleted
						json: function () {
							res.json({message: 'deleted',
								item: place
							});
						}
					});
				}
			});
		}
	});
});

function formValidation(place) {
	var isInvalid = false;
	var message = '';
	var reg = new RegExp("^-?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$"); // lat-lng validator regexp
	
	if( '' === place.name){
		message += 'Please fill the name field.<br />';
		isInvalid = true;
	}
	
	if( !reg.exec(place.lat) ){
		message += 'Lat filed is invalid.<br />';
		isInvalid = true;
	}
	
	if( !reg.exec(place.lng) ){
		message += 'Lng filed is invalid.<br />';
		isInvalid = true;
	}
	return {
		isInvalid: isInvalid,
		message: message
	};
}

module.exports = router;