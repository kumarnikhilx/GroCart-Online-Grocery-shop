import { Router } from "express";
import { authenticate } from "./../middlewares/authMiddleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    forgotPassword,
    verifyOtp,
    resetPassword,
} from "../controllers/userController.js";

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.delete("/logout", logoutUser);
userRouter.get("/me", authenticate, getCurrentUser);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/reset-password", resetPassword);

export default userRouter;
