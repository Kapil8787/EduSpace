const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = async () => {
    try {
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL is missing in environment variables");
        }

        // Avoid buffering DB operations when disconnected.
        mongoose.set("bufferCommands", false);

        await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000),
            socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 45000),
            maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 10),
        });

        console.log("DB Connected Successfully");
    } catch (error) {
        console.log("DB Connection Failed");
        console.error(error);
        throw error;
    }
};
