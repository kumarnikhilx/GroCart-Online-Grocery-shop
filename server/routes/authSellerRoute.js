import { Router } from "express";
import { authenticate, authorize, softAuthenticate } from "./../middlewares/authMiddleware.js";
import {
    sellerLogin,
    sellerLogout,
    getCurrentSeller,
} from "../controllers/authSellerController.js";

const authSellerRouter = Router();

authSellerRouter.post("/login", sellerLogin);
authSellerRouter.post("/logout", sellerLogout);
authSellerRouter.get("/me", softAuthenticate, getCurrentSeller);

export default authSellerRouter;
