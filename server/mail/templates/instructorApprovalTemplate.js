const instructorApprovalTemplate = (firstName) => {
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<title>Instructor Application Approved</title>
		</head>
		<body>
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f8f8f8;">
				<h2 style="color:#0f172a;">Congrats ${firstName}</h2>
				<p style="font-size:1rem; color:#334155;">Your instructor application has been verified and approved by EduSpace Admin.</p>
				<p style="font-size:1rem; color:#334155;">You now have full instructor access and can start creating courses.</p>
				<p style="font-size:0.9rem; color:#667085;">If you have questions, reach out to us anytime.</p>
			</div>
		</body>
		</html>
	`;
};

module.exports = instructorApprovalTemplate;
