const mongoose = require("mongoose");

// Define the Profile schema
const profileSchema = new mongoose.Schema({
	gender: {
		type: String,
	},
	dateOfBirth: {
		type: String,
	},
	about: {
		type: String,
		trim: true,
	},
	contactNumber: {
		type: Number,
		trim: true,
	},
	instituteName: {
		type: String,
		trim: true,
	},
	linkedin: {
		type: String,
		trim: true,
	},
	experience: {
		type: Number,
		min: 0,
	},
});

// Export the Profile model
module.exports = mongoose.model("Profile", profileSchema);