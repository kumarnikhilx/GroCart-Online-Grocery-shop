import "dotenv/config.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/User.js";

const seedSeller = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        const sellerEmail = process.env.SELLER_EMAIL || "admin@grocart.com";
        const sellerPassword = process.env.SELLER_PASSWORD || "admin@123";

        // Check if seller already exists
        const existingSeller = await User.findOne({ email: sellerEmail });

        if (existingSeller) {
            console.log("Seller account already exists in the database. Updating password just in case...");
            existingSeller.password = sellerPassword; // The pre-save hook in User model will hash it
            await existingSeller.save();
            console.log("Seller account updated successfully.");
        } else {
            console.log("Creating new seller account...");
            const newSeller = new User({
                name: "Admin Seller",
                email: sellerEmail,
                password: sellerPassword,
                role: "seller",
            });

            await newSeller.save();
            console.log("Seller account created successfully.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error seeding seller account:", error.message);
        process.exit(1);
    }
};

seedSeller();
