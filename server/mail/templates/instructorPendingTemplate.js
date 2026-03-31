const instructorPendingTemplate = (firstName) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Instructor Application Pending</title>
    </head>
    <body>
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f8f8f8;">
        <h2 style="color: #0f172a;">Hello ${firstName},</h2>
        <p style="font-size:1rem; color:#334155;">Thank you for registering as an instructor on EduSpace.</p>
        <p style="font-size:1rem; color:#334155;">Your application is now pending admin approval. This may take a few minutes.</p>
        <p style="font-size:1rem; color:#334155;">You will receive another email once your account is approved or rejected.</p>
        <p style="font-size:0.9rem; color:#667085;">If you have any questions, please contact support.</p>
      </div>
    </body>
    </html>
  `;
};

module.exports = instructorPendingTemplate;
