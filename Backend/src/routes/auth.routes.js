import { Router } from "express";
import { registerUser, loginUser, refreshAccessToken } from "../controllers/auth.controller.js"; 

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */

router.post("/register", registerUser);

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */

router.post("/login", loginUser);

/**
 * @route GET /api/auth/refresh-token
 * @desc Refresh the access token
 * @access Public
 */

router.get("/refresh-token", refreshAccessToken);

export default router;