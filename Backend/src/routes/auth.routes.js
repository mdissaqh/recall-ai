import { Router } from "express";
import { registerUser } from "../controllers/auth.controller.js"; 

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */

router.get("/register", registerUser);

export default router;