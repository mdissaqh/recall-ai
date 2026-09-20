import userModel from "../models/user.model.js";

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