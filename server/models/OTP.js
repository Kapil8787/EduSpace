const mongoose = require("mongoose");
const OTPSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
	},
});

<<<<<<< HEAD
// Define a function to send emails
async function sendVerificationEmail(email, otp) {
	// Create a transporter to send emails

	// Define the email options

	// Send the email
	try {
		const mailResponse = await mailSender(
			email,
			"Verification Email",
			emailTemplate(otp)
		);
		console.log("Email sent successfully: ", mailResponse);
	} catch (error) {
		console.log("Error occurred while sending email: ", error);
		throw error;
	}
}

// Define a post-save hook to send email after the document has been saved
// Define a post-save hook to send email after the document has been saved
OTPSchema.pre("save", async function (next) {
	console.log("New document saved to database");

	// Only send an email when a new document is created
	if (this.isNew) {
		try {
			await sendVerificationEmail(this.email, this.otp);
		} catch (error) {
			console.error("OTP email sending failed:", error);
			// Don't proceed if email fails
			return next(new Error("Failed to send OTP email. Please try again."));
		}
	}
	next();
});
=======
OTPSchema.index({ email: 1, createdAt: -1 });
>>>>>>> 88cd6ece3d60c930fd69ce3625ca8630de825ead

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
