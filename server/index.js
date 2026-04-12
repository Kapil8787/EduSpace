const express = require("express");

const app = express();

const userRoutes = require("./routes/User");
const paymentRoutes = require("./routes/Payments");
const profileRoutes = require("./routes/Profile");
const CourseRoutes = require("./routes/Course");

const database = require("./config/database");
const cookieParser = require("cookie-parser");

const cors = require("cors");
const fileUpload = require("express-fileupload");
const { cloudnairyconnect } = require("./config/cloudinary");

const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

const normalizeOrigin = (originValue) =>
  String(originValue).trim().replace(/\/+$/, "").toLowerCase();

const parseAllowedOrigins = (rawOrigins) => {
  if (!rawOrigins) {
    return null;
  }

  const trimmedOrigins = rawOrigins.trim();
  if (!trimmedOrigins || trimmedOrigins === "*") {
    return null;
  }

  try {
    const parsedOrigins = JSON.parse(trimmedOrigins);

    if (Array.isArray(parsedOrigins)) {
      return parsedOrigins.map((origin) => String(origin).trim()).filter(Boolean);
    }

    if (typeof parsedOrigins === "string") {
      return [parsedOrigins.trim()].filter(Boolean);
    }
  } catch (error) {
    return trimmedOrigins
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  return null;
};

const allowedOrigins = parseAllowedOrigins(process.env.CORS_ORIGIN);
const wildcardRegexCache = new Map();

const getWildcardRegex = (pattern) => {
  const cachedRegex = wildcardRegexCache.get(pattern);
  if (cachedRegex) {
    return cachedRegex;
  }

  const escapedPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  const regex = new RegExp(`^${escapedPattern}$`, "i");
  wildcardRegexCache.set(pattern, regex);

  return regex;
};

const isOriginAllowed = (requestOrigin, originRules) => {
  const normalizedRequestOrigin = normalizeOrigin(requestOrigin);

  return originRules.some((rule) => {
    const normalizedRule = normalizeOrigin(rule);

    if (!normalizedRule || normalizedRule === "*") {
      return true;
    }

    if (!normalizedRule.includes("*")) {
      return normalizedRule === normalizedRequestOrigin;
    }

    return getWildcardRegex(normalizedRule).test(normalizedRequestOrigin);
  });
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || !allowedOrigins) {
        return callback(null, true);
      }

      if (isOriginAllowed(origin, allowedOrigins)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    maxAge: 14400,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

cloudnairyconnect();

app.use("/api/v1/auth", userRoutes);

app.use("/api/v1/payment", paymentRoutes);

app.use("/api/v1/profile", profileRoutes);

app.use("/api/v1/course", CourseRoutes);

app.use("/api/v1/contact", require("./routes/ContactUs"));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});

const startServer = async () => {
  try {
    const dbConnectTimeoutMs = Number(process.env.DB_CONNECT_TIMEOUT_MS || 15000);
    await Promise.race([
      database.connect(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Database connection timed out after ${dbConnectTimeoutMs}ms`)),
          dbConnectTimeoutMs
        )
      ),
    ]);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed due to database connection error:", error.message);
    process.exit(1);
  }
};

startServer();
