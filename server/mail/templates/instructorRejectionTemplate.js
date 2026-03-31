const instructorRejectionTemplate = (firstName, reason = "Your request did not meet our quality criteria.") => {
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<title>Instructor Application Rejected</title>
		</head>
		<body>
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f8f8f8;">
				<h2 style="color:#0f172a;">Hello ${firstName},</h2>
				<p style="font-size:1rem; color:#334155;">We are sorry to inform you that your instructor application has been rejected.</p>
				<p style="font-size:1rem; color:#334155;">Reason: ${reason}</p>
				<p style="font-size:1rem; color:#334155;">You can try signing up again after resolving the issue.</p>
				<p style="font-size:0.9rem; color:#667085;">If you have questions, reply to this email for support.</p>
			</div>
		</body>
		</html>
	`;
};

module.exports = instructorRejectionTemplate;
