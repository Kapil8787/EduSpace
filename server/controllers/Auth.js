const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const emailVerificationTemplate = require("../mail/templates/emailVerificationTemplate");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

// Signup Controller for Registering USers

exports.signup = async (req, res) => {
	try {
		// Destructure fields from the request body
		const {
			firstName,
			lastName,
			email,
			password,
			confirmPassword,
			accountType,
			contactNumber,
			instituteName,
			linkedin,
			experience,
			otp,
		} = req.body;

		// Validate required fields
		if (!firstName || !lastName || !email || !password || !confirmPassword || !otp || !accountType) {
			return res.status(400).json({
				success: false,
				message: "All required fields are required",
			});
		}
		const normalizedEmail = email.trim().toLowerCase();

		const normalizedAccountType = accountType.trim();
		if (!["Student", "Instructor", "Admin"].includes(normalizedAccountType)) {
			return res.status(400).json({
				success: false,
				message: "Invalid account type",
			});
		}

		if (password !== confirmPassword) {
			return res.status(400).json({
				success: false,
				message: "Password and Confirm Password do not match",
			});
		}

		if (normalizedAccountType === "Instructor") {
			if (!instituteName || !linkedin || experience === undefined || experience === null) {
				return res.status(400).json({
					success: false,
					message: "Instructor profile requires instituteName, linkedin, and experience",
				});
			}
			if (isNaN(Number(experience)) || Number(experience) < 0) {
				return res.status(400).json({
					success: false,
					message: "Experience must be a non-negative number",
				});
			}
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email: normalizedEmail });
		if (existingUser && existingUser.active) {
			return res.status(400).json({
				success: false,
				message: "User already exists. Please sign in to continue.",
			});
		}

		// If previous instructor was rejected at admin level, remove stale/soft-deleted user to allow re-signup.
		if (existingUser && !existingUser.active) {
			await Profile.findByIdAndDelete(existingUser.additionalDetails);
			await User.findByIdAndDelete(existingUser._id);
		}

		// Find the most recent OTP for the email
		const recentOtp = await OTP.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
		if (!recentOtp || otp !== recentOtp.otp) {
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		const approved = normalizedAccountType === "Instructor" ? false : true;

		// Create the Additional Profile For User
		const profileDetails = await Profile.create({
			gender: null,
			dateOfBirth: null,
			about: null,
			contactNumber: contactNumber || null,
			instituteName: normalizedAccountType === "Instructor" ? instituteName : null,
			linkedin: normalizedAccountType === "Instructor" ? linkedin : null,
			experience: normalizedAccountType === "Instructor" ? Number(experience) : null,
		});

		const user = await User.create({
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			email: normalizedEmail,
			password: hashedPassword,
			accountType: normalizedAccountType,
			approved,
			additionalDetails: profileDetails._id,
			image: `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(
				firstName + " " + lastName
			)}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300,ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4&backgroundType=solid,gradientLinear&backgroundRotation=0,360,-350,-340,-330,-320&fontFamily=Arial&fontWeight=600`,
		});

		if (normalizedAccountType === "Instructor") {
			const instructorPendingTemplate = require("../mail/templates/instructorPendingTemplate");
			await mailSender(
				user.email,
				"EduSpace - Instructor Application Pending Approval",
				instructorPendingTemplate(user.firstName || user.email)
			);
		}

		return res.status(200).json({
			success: true,
			user,
			message: "User registered successfully",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "User cannot be registered. Please try again.",
		});
	}
};

// Login controller for authenticating users
exports.login = async (req, res) => {
	try {
		// Get email and password from request body
		const { email, password } = req.body;

		// Check if email or password is missing
		if (!email || !password) {
			// Return 400 Bad Request status code with error message
			return res.status(400).json({
				success: false,
				message: `Please Fill up All the Required Fields`,
			});
		}

		// Find user with provided email
		const user = await User.findOne({ email }).populate("additionalDetails");

		// If user not found with provided email
		if (!user) {
			// Return 401 Unauthorized status code with error message
			return res.status(401).json({
				success: false,
				message: `User is not Registered with Us Please SignUp to Continue`,
			});
		}

		if (user.active === false) {
			return res.status(403).json({
				success: false,
				message: "Account is inactive",
			});
		}

		// Block unapproved instructors (active users waiting admin approval)
		if (user.accountType === "Instructor" && !user.approved) {
			return res.status(403).json({
				success: false,
				message: "Account pending approval",
			});
		}

		// Generate JWT token and Compare Password
		if (await bcrypt.compare(password, user.password)) {
			const token = jwt.sign(
				{ email: user.email, id: user._id, accountType: user.accountType },
				process.env.JWT_SECRET,
				{
					expiresIn: "24h",
				}
			);

			// Save token to user document in database
			user.token = token;
			user.password = undefined;
			// Set cookie for token and return success response
			const options = {
				expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				httpOnly: true,
			};
			res.cookie("token", token, options).status(200).json({
				success: true,
				token,
				user,
				message: `User Login Success`,
			});
		} else {
			return res.status(401).json({
				success: false,
				message: `Password is incorrect`,
			});
		}
	} catch (error) {
		console.error(error);
		// Return 500 Internal Server Error status code with error message
		return res.status(500).json({
			success: false,
			message: `Login Failure Please Try Again`,
		});
	}
};
// Send OTP For Email Verification
exports.sendotp = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({
				success: false,
				message: "Email is required",
			});
		}

		const normalizedEmail = email.trim().toLowerCase();

		// Check if user is already present
		const checkUserPresent = await User.findOne({ email: normalizedEmail });
		// If user exists but is soft-inactive (rejected), clear stale account and allow re-OTP
		if (checkUserPresent && checkUserPresent.active === false) {
			await Profile.findByIdAndDelete(checkUserPresent.additionalDetails);
			await User.findByIdAndDelete(checkUserPresent._id);
		}

		// to be used in case of signup
		// If user found with provided email
		if (checkUserPresent && checkUserPresent.active) {
			return res.status(401).json({
				success: false,
				message: `User is Already Registered`,
			});
		}

		let otp = otpGenerator.generate(6, {
			upperCaseAlphabets: false,
			lowerCaseAlphabets: false,
			specialChars: false,
		});

		let result = await OTP.findOne({ otp });
		while (result) {
			otp = otpGenerator.generate(6, {
				upperCaseAlphabets: false,
				lowerCaseAlphabets: false,
				specialChars: false,
			});
			result = await OTP.findOne({ otp });
		}

		const otpBody = await OTP.create({ email: normalizedEmail, otp });

		try {
			await mailSender(
				normalizedEmail,
				"EduSpace - Email Verification OTP",
				emailVerificationTemplate(otp)
			);
		} catch (mailError) {
			await OTP.findByIdAndDelete(otpBody._id);
			throw new Error(`Unable to send OTP email. ${mailError.message || "Please try again."}`);
		}

		res.status(200).json({
			success: true,
			message: `OTP Sent Successfully`,
		});
	} catch (error) {
		console.log(error.message);
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to send OTP",
		});
	}
};





// Controller for Changing Password
exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if(oldPassword === newPassword){
			return res.status(400).json({
				success: false,
				message: "New Password cannot be same as Old Password",
			});
		}
		
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				"EduSpace - Password Updated",
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};

