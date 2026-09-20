import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateRefreshToken = (user) => {
    const refreshToken = jwt.sign({
        id: user._id,
        email: user.email
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    return refreshToken;
}

const generateAccessToken = (user) => {
    const accessToken = jwt.sign({
        id: user._id,
        email: user.email
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    return accessToken;
}

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: `${!name ? "Name is required" : ""} ${!email ? "Email is required" : ""} ${!password ? "Password is required" : ""}`.trim(),
                success: false
            })
        }
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists",
                success: false
            })
        }
        const newUser = await userModel.create({
            name,
            email,
            password
        });

        const refreshToken = generateRefreshToken(newUser);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(201).json({
            message: "User registered successfully",
            success: true,
            user: newUser
        });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: `${!email ? "Email is required" : ""} ${!password ? "Password is required" : ""}`.trim(),
                success: false
            })
        }

        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid password",
                success: false
            })
        }

        const refreshToken = generateRefreshToken(user);
        
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            message: "User logged in successfully",
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                authProvider: user.authProvider
            }
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

export const refreshAccessToken = (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token not found",
                success: false
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const accessToken = generateAccessToken(decoded);

        return res.status(200).json({
            message: "Access token refreshed successfully",
            success: true,
            accessToken: accessToken
        });
    } catch (error) {
        console.error("Error refreshing access token:", error);
        return res.status(401).json({
            message: "Invalid refresh token",
            success: false
        });
    }
}