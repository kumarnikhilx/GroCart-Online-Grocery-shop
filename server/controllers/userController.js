import asyncHandler from "express-async-handler";
import CustomError from "../utils/CustomError.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import genToken from "../utils/jwt.js";
import {
    registerUserSchema,
    loginUserSchema,
} from "../utils/userValidation.js";
import { NODE_ENV } from "../config/index.js";
import sendEmail from "../utils/sendEmail.js";

//! Register User : /api/user/register

export const registerUser = asyncHandler(async (req, res, next) => {
    const { error } = registerUserSchema.validate(req.body);
    if (error) {
        const message = `The field '${error.details[0].context.key}' is missing or invalid. Please provide a valid value.`;
        return next(new CustomError(400, message));
    }

    const { name, email, password, role } = req.body;

    const existinUser = await User.findOne({ email });

    if (existinUser) {
        return next(new CustomError(409, "User already exists"));
    }

    const user = await User.create({ name, email, password, role });

    const token = await genToken(user._id);

    res.cookie("token", token, {
        httpOnly: true, // Prevent JavaScript to access cookie
        secure: NODE_ENV === "production", // Use secure cookies in production
        sameSite: NODE_ENV === "production" ? "none" : "lax", // CSRF production
        maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time
    });

    res.status(201).json({
        success: true,
        message: "New user created successfully",
        user: { name: user.name, email: user.email, role: user.role },
    });
});

//! Login User : /api/user/login

export const loginUser = asyncHandler(async (req, res, next) => {
    const { error } = loginUserSchema.validate(req.body);
    if (error) {
        const message = `The field '${error.details[0].context.key}' is missing or invalid. Please provide a valid value.`;
        return next(new CustomError(400, message));
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return next(new CustomError(404, "User not found"));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return next(new CustomError(401, "Invalid credentials"));
    }

    const token = await genToken(user._id);

    res.cookie("token", token, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        message: "User logged-in successfully",
        user: { email: user.email, name: user.name, role: user.role },
    });
});

//! Logout User : /api/user/logout

export const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
        success: true,
        message: "Logged-out successfully",
    });
});

//! Get logged-in user details: /api/user/me

export const getCurrentUser = (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
};

//! Forgot Password : /api/user/forgot-password
export const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    if (!email) return next(new CustomError(400, "Email is required"));

    const user = await User.findOne({ email });
    if (!user) return next(new CustomError(404, "User not found"));

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP before saving
    const salt = await bcrypt.genSalt(10);
    user.resetPasswordOTP = await bcrypt.hash(otp, salt);
    user.resetPasswordOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    
    await user.save();

    // Send email
    try {
        const message = `
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password.</p>
            <p>Your OTP is: <strong>${otp}</strong></p>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `;
        
        await sendEmail({
            email: user.email,
            subject: "GroCart - Password Reset OTP",
            html: message,
        });

        res.status(200).json({ success: true, message: "OTP sent to your email" });
    } catch (error) {
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpiry = undefined;
        await user.save();
        console.error("Email sending error:", error);
        return next(new CustomError(500, "Email could not be sent. Make sure EMAIL_USER and EMAIL_PASS are set in .env."));
    }
});

//! Verify OTP : /api/user/verify-otp
export const verifyOtp = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;
    
    if (!email || !otp) return next(new CustomError(400, "Email and OTP are required"));

    const user = await User.findOne({ 
        email, 
        resetPasswordOTPExpiry: { $gt: Date.now() } 
    });

    if (!user || (!user.resetPasswordOTP)) {
        return next(new CustomError(400, "OTP is invalid or has expired"));
    }

    const isMatch = await bcrypt.compare(otp, user.resetPasswordOTP);
    if (!isMatch) {
         return next(new CustomError(400, "Invalid OTP"));
    }

    res.status(200).json({ success: true, message: "OTP verified correctly" });
});

//! Reset Password : /api/user/reset-password
export const resetPassword = asyncHandler(async (req, res, next) => {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) return next(new CustomError(400, "Email, OTP, and new password are required"));

    const user = await User.findOne({ 
        email, 
        resetPasswordOTPExpiry: { $gt: Date.now() } 
    });

    if (!user || (!user.resetPasswordOTP)) {
        return next(new CustomError(400, "OTP is invalid or has expired"));
    }

    const isMatch = await bcrypt.compare(otp, user.resetPasswordOTP);
    if (!isMatch) {
         return next(new CustomError(400, "Invalid OTP"));
    }
    
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;
    
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
});
