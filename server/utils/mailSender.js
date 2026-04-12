const nodemailer = require("nodemailer");
require('dotenv').config()

let cachedTransporter;

const getTransporter = () => {
    if (cachedTransporter) {
        return cachedTransporter;
    }

    const host = process.env.MAIL_HOST?.trim();
    const user = process.env.MAIL_USER?.trim();
    // Gmail app passwords are often pasted with spaces; strip them safely.
    const pass = process.env.MAIL_PASS ? process.env.MAIL_PASS.replace(/\s+/g, "") : "";
    const port = Number(process.env.MAIL_PORT || 587);
    const secure = process.env.MAIL_SECURE ? process.env.MAIL_SECURE === "true" : port === 465;

    if (!host || !user || !pass) {
        throw new Error("Mail configuration is missing. Please check MAIL_HOST, MAIL_USER, and MAIL_PASS.");
    }

    cachedTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user,
            pass,
        },
        connectionTimeout: Number(process.env.MAIL_CONNECTION_TIMEOUT || 10000),
        greetingTimeout: Number(process.env.MAIL_GREETING_TIMEOUT || 10000),
        socketTimeout: Number(process.env.MAIL_SOCKET_TIMEOUT || 15000),
    });

    return cachedTransporter;
};

const mailSender = async (email, title, body) => {
    try{
            const transporter = getTransporter();

            const info = await transporter.sendMail({
                from: `"EduSpace" <${process.env.MAIL_USER?.trim()}>`,
                to:`${email}`,
                subject: `${title}`,
                html: `${body}`,
            });

            console.log("Email sent:", info.messageId);
            return info;
    }
    catch(error) {
        console.error("mailSender error:", error);
        throw new Error(error?.response || error?.message || "Failed to send email");
    }
}


module.exports = mailSender;
