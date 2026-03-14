import asyncHandler from "express-async-handler";
import CustomError from "../utils/CustomError.js";
import genToken from "../utils/jwt.js";
import {
    NODE_ENV,
    SELLER_EMAIL,
    SELLER_PASSWORD,
} from "../config/index.js";

//! Login Seller via ENV : /api/seller/login

export const sellerLogin = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (email === SELLER_EMAIL && password === SELLER_PASSWORD) {
        // "seller_env_account" is a mock ID to recognize in auth middleware
        const token = await genToken("seller_env_account");

        res.cookie("token", token, {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time
        });

        res.status(200).json({
            success: true,
            message: "Seller logged in securely",
            user: { email: SELLER_EMAIL, name: "Admin Seller", role: "seller" },
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
