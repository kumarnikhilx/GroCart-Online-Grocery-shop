import asyncHandler from "express-async-handler";
import CustomError from "../utils/CustomError.js";
import genToken from "../utils/jwt.js";
import {
    NODE_ENV,
    SELLER_EMAIL,
    SELLER_PASSWORD,
} from "../config/index.js";
import User from "../models/User.js";

//! Login Seller via ENV : /api/seller/login

export const sellerLogin = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Check DB first
    let user = await User.findOne({ email, role: "seller" });
    let isMatch = false;
    let sellerId = null;

    if (user) {
        isMatch = await user.comparePassword(password);
        sellerId = user._id;
    } else if (email === SELLER_EMAIL && password === SELLER_PASSWORD) {
        // Fallback to ENV vars
        isMatch = true;
        sellerId = "seller_env_account";
        user = { email: SELLER_EMAIL, name: "Admin Seller", role: "seller" };
    }

    if (isMatch) {
        const token = await genToken(sellerId);

        res.cookie("token", token, {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            message: "Seller logged in securely",
            user: { email: user.email, name: user.name, role: "seller" },
        });
    } else {
        return next(new CustomError(401, "Invalid seller credentials"));
    }
});

//! Logout Seller : /api/seller/logout

export const sellerLogout = asyncHandler(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "none" : "strict",
    });

    res.status(200).json({
        success: true,
        message: "Seller logged out successfully",
    });
});

//! Get logged-in seller details: /api/seller/me

export const getCurrentSeller = (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
};
