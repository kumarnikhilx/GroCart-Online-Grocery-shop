import mongoose from "mongoose";
import { MONGODB_URI } from "./index.js";

const connectDB = async () => {
    try {
        if (!MONGODB_URI) {
            console.warn("MONGODB_URI is missing. Please set it in your .env file.");
            return;
        }
        mongoose.connection.on("connected", () =>
            console.log("Database Connected")
        );
        const formattedUri = MONGODB_URI.endsWith("/") ? MONGODB_URI.slice(0, -1) : MONGODB_URI;
        await mongoose.connect(`${formattedUri}/greencart`);
    } catch (error) {
        console.error("MongoDB Connection Error: ", error.message);
    }
};

export default connectDB;
