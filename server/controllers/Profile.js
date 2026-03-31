const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const mailSender = require("../utils/mailSender");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const instructorRejectionTemplate = require("../mail/templates/instructorRejectionTemplate");
// Method for updating a profile
exports.updateProfile = async (req, res) => {
	try {
		const { dateOfBirth = "", about = "", contactNumber="",firstName,lastName,gender="" } = req.body;
		const id = req.user.id;

		// Find the profile by id
		const userDetails = await User.findById(id);
		const profile = await Profile.findById(userDetails.additionalDetails);

		// Update the profile fields
		userDetails.firstName = firstName || userDetails.firstName;
		userDetails.lastName = lastName || userDetails.lastName;
		profile.dateOfBirth = dateOfBirth || profile.dateOfBirth;
		profile.about = about || profile.about;
		profile.gender=gender || profile.gender;
		profile.contactNumber = contactNumber || profile.contactNumber;

		// Save the updated profile
		await profile.save();
		await userDetails.save();

		return res.json({
			success: true,
			message: "Profile updated successfully",
			profile,
			userDetails
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

exports.deleteAccount = async (req, res) => {
	try {
		// TODO: Find More on Job Schedule
		// const job = schedule.scheduleJob("10 * * * * *", function () {
		// 	console.log("The answer to life, the universe, and everything!");
		// });
		// console.log(job);
		const id = req.user.id;
		const user = await User.findById({ _id: id });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}
		// Delete Associated Profile with the User
		await Profile.findByIdAndDelete({ _id: user.additionalDetails });
		// Delete this user's courses as well (instructor account deletion)
		await Course.deleteMany({ instructor: id });
		// TODO: Unenroll User From All the Enrolled Courses
		// Now Delete User
		await User.findByIdAndDelete({ _id: id });
		res.status(200).json({
			success: true,
			message: "User deleted successfully",
		});
	} catch (error) {
		console.log(error);
		res
			.status(500)
			.json({ success: false, message: "User Cannot be deleted successfully",error:error.message });
	}
};

exports.getAllUserDetails = async (req, res) => {
	try {
		const id = req.user.id;
		const userDetails = await User.findById(id)
			.populate("additionalDetails")
			.exec();
		console.log(userDetails);
		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: userDetails,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.getPendingInstructors = async (req, res) => {
	try {
		const pendingInstructors = await User.find({
			accountType: "Instructor",
			approved: false,
			active: true,
		})
			.populate("additionalDetails")
			.exec();

		return res.status(200).json({
			success: true,
			message: "Pending Instructors fetched successfully",
			data: pendingInstructors,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Unable to fetch pending instructors",
			error: error.message,
		});
	}
};

exports.approveInstructor = async (req, res) => {
	try {
		const { instructorId } = req.body;
		if (!instructorId) {
			return res.status(400).json({
				success: false,
				message: "Instructor id is required",
			});
		}

		const instructor = await User.findOne({
			_id: instructorId,
			accountType: "Instructor",
			approved: false,
			active: true,
		}).populate("additionalDetails");

		if (!instructor) {
			return res.status(404).json({
				success: false,
				message: "Pending instructor not found",
			});
		}

		instructor.approved = true;
		await instructor.save();

		// Send approval email
		const instructorApprovalTemplate = require("../mail/templates/instructorApprovalTemplate");
		await mailSender(
			instructor.email,
			"EduSpace - Instructor Approved",
			instructorApprovalTemplate(instructor.firstName)
		);

		return res.status(200).json({
			success: true,
			message: "Instructor approved successfully",
			data: instructor,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Unable to approve instructor",
			error: error.message,
		});
	}
};

exports.rejectInstructor = async (req, res) => {
	try {
		const { instructorId, reason } = req.body;
		if (!instructorId) {
			return res.status(400).json({
				success: false,
				message: "Instructor id is required",
			});
		}

		const instructor = await User.findOne({
			_id: instructorId,
			accountType: "Instructor",
			approved: false,
			active: true,
		});

		if (!instructor) {
			// Already rejected or processed; treat as success for idempotency
			return res.status(200).json({
				success: true,
				message: "Instructor is already rejected or not pending",
			});
		}

		// Mark inactive and unapproved to prevent login prior to cleanup
		instructor.active = false;
		instructor.approved = false;
		instructor.token = null;
		await instructor.save();

		// Delete the profile document if present
		if (instructor.additionalDetails) {
			await Profile.findByIdAndDelete(instructor.additionalDetails);
		}

		// Send rejection email (do not fail route if email sending fails)
		try {
			await mailSender(
				instructor.email,
				"EduSpace - Instructor Application Rejected",
				instructorRejectionTemplate(instructor.firstName || instructor.email, reason)
			);
		} catch (emailError) {
			console.error("Instructor rejection email failed:", emailError);
		}

		// Also delete course content by this instructor to avoid dangling homepage tiles
		await Course.deleteMany({ instructor: instructorId });

		// Finally remove user record
		await User.findByIdAndDelete(instructorId);

		return res.status(200).json({
			success: true,
			message: `Instructor rejected successfully${reason ? `: ${reason}` : ""}`,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Unable to reject instructor",
			error: error.message,
		});
	}
};

exports.getEnrolledCourses=async (req,res) => {
	try {
        const id = req.user.id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const enrolledCourses = await User.findById(id).populate({
			path : "courses",
				populate : {
					path: "courseContent",
			}
		}
		).populate("courseProgress").exec();
        // console.log(enrolledCourses);
        res.status(200).json({
            success: true,
            message: "User Data fetched successfully",
            data: enrolledCourses,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

//updateDisplayPicture
exports.updateDisplayPicture = async (req, res) => {
	try {

		const id = req.user.id;
	const user = await User.findById(id);
	if (!user) {
		return res.status(404).json({
            success: false,
            message: "User not found",
        });
	}
	const image = req.files.pfp;
	if (!image) {
		return res.status(404).json({
            success: false,
            message: "Image not found",
        });
    }
	const uploadDetails = await uploadImageToCloudinary(
		image,
		process.env.FOLDER_NAME
	);
	console.log(uploadDetails);

	const updatedImage = await User.findByIdAndUpdate({_id:id},{image:uploadDetails.secure_url},{ new: true });

    res.status(200).json({
        success: true,
        message: "Image updated successfully",
        data: updatedImage,
    });
		
	} catch (error) {
		return res.status(500).json({
            success: false,
            message: error.message,
        });
		
	}



}

//instructor dashboard
exports.instructorDashboard = async (req, res) => {
	try {
		const id = req.user.id;
		const courseData = await Course.find({instructor:id});
		const courseDetails = courseData.map((course) => {
			totalStudents = course?.studentsEnrolled?.length;
			totalRevenue = course?.price * totalStudents;
			const courseStats = {
				_id: course._id,
				courseName: course.courseName,
				courseDescription: course.courseDescription,
				totalStudents,
				totalRevenue,
			};
			return courseStats;
		});
		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: courseDetails,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}