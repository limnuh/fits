var mongoose = require('mongoose');  
var placeSchema = new mongoose.Schema({  
	place_id: Number,
	name: String,
	address: String,
	group: String,
	open: String,
	findme: String,
	lat: Number,
	lng: Number
});
mongoose.model('Place', placeSchema);