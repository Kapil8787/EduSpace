const nodemailer = require("nodemailer");
require('dotenv').config()

const transporterCache = new Map();

const getPrimaryConfig = () => {
    const host = process.env.MAIL_HOST?.trim();
    const user = process.env.MAIL_USER?.trim();
    // Gmail app passwords are often pasted with spaces; strip them safely.
    const pass = process.env.MAIL_PASS ? process.env.MAIL_PASS.replace(/\s+/g, "") : "";
    const port = Number(process.env.MAIL_PORT || 587);
    const secure = process.env.MAIL_SECURE ? process.env.MAIL_SECURE === "true" : port === 465;

    if (!host || !user || !pass) {
        throw new Error("Mail configuration is missing. Please check MAIL_HOST, MAIL_USER, and MAIL_PASS.");
    }

    const ipFamily = Number(process.env.MAIL_IP_FAMILY || 4);
    const resolvedFamily = [0, 4, 6].includes(ipFamily) ? ipFamily : 4;

    return {
        host,
        port,
        secure,
        // Render often fails on IPv6 routes to Gmail SMTP. Prefer IPv4 unless overridden.
        family: resolvedFamily,
        auth: { user, pass },
        connectionTimeout: Number(process.env.MAIL_CONNECTION_TIMEOUT || 30000),
        greetingTimeout: Number(process.env.MAIL_GREETING_TIMEOUT || 30000),
        socketTimeout: Number(process.env.MAIL_SOCKET_TIMEOUT || 30000),
        tls: {
            servername: host,
        },
    };
};

const buildAttemptConfigs = () => {
    const primary = getPrimaryConfig();
    const configs = [primary];

    // Render/network specific fallback: try alternate Gmail SMTP port.
    const isGmail = primary.host.toLowerCase() === "smtp.gmail.com";
    const disableFallback = process.env.MAIL_DISABLE_GMAIL_FALLBACK === "true";

    if (isGmail && !disableFallback) {
        const fallbackPort = primary.port === 587 ? 465 : 587;
        configs.push({
            ...primary,
            port: fallbackPort,
            secure: fallbackPort === 465,
        });
    }

    return configs;
};

const getTransporter = (config) => {
    const key = `${config.host}:${config.port}:${config.secure}:${config.family}:${config.auth.user}`;
    const cached = transporterCache.get(key);
    if (cached) return cached;

    const transporter = nodemailer.createTransport(config);
    transporterCache.set(key, transporter);
    return transporter;
};

const mailSender = async (email, title, body) => {
    const configs = buildAttemptConfigs();
    const errors = [];

    for (let attempt = 0; attempt < configs.length; attempt += 1) {
        const config = configs[attempt];
        try{
            const transporter = getTransporter(config);
            const info = await transporter.sendMail({
                from: `"EduSpace" <${config.auth.user}>`,
                to:`${email}`,
                subject: `${title}`,
                html: `${body}`,
            });

            console.log(`Email sent: ${info.messageId} via ${config.host}:${config.port}`);
            return info;
        }
        catch(error) {
            const errorMessage = error?.response || error?.message || "Failed to send email";
            errors.push(
                `attempt ${attempt + 1} (${config.host}:${config.port}, secure=${config.secure}): ${errorMessage}`
            );
            console.error("mailSender attempt failed:", errorMessage);
        }
    }

    throw new Error(errors.join(" | "));
}


module.exports = mailSender;
