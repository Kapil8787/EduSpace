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
database.connect();

app.use(express.json());
app.use(cookieParser());

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

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || !allowedOrigins) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
