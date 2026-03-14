import { Router } from "express";
import { authenticate, authorize } from "./../middlewares/authMiddleware.js";
import {
    sellerLogin,
    sellerLogout,
    getCurrentSeller,
} from "../controllers/authSellerController.js";

const authSellerRouter = Router();

authSellerRouter.post("/login", sellerLogin);
authSellerRouter.post("/logout", sellerLogout);
// Ensure both authenticated AND authorized (role: seller)
authSellerRouter.get("/me", authenticate, authorize, getCurrentSeller);

export default authSellerRouter;
