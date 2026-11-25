const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const signup = async(req , res) => {
    try{
        const {name , email , password} = req.body;

        const normalizeEmail = email.trim().toLowerCase();

        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if(password.length < 6){
            return res.status(400).json({
                success: false,
                message: "Password must be atleast 6 characters"
            });
        }

        const existingUser = await User.findOne({ email: normalizeEmail });

        if(existingUser){
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email: normalizeEmail,
            password: hashedPassword
        });

        return res.status(200).json({
            success: true,
            message: "Account created Successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            }
        });
    }catch(error){
        console.log("SignUp Error: " , error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const login = async(req, res) => {
    try{
        const{ email , password } = req.body;

        if(!email || !password){
            return res.status(400).json({
                success: false ,
                message: "All fields are required"
            });
        }

        const user = await User.findOne({
            email : email.trim().toLowerCase()
        });

        if(!user){
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if(!isPasswordValid){
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login Sucessfull",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }catch(error){
        console.log("Login error: " , error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getme = async(req, res) => {
    return res.status(200).json({
        success: true,
        user: req.user
    });
};

const forgotPassword = async(req, res) => {
    try{
        const { email } = req.body;

        if(!email){
            return res.status(400).json({
                success: false,
                message: "Please provide your email"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if(!user){
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedResetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset token generates Sucessfully",
            resetToken
        });
    }catch(error){
        console.log("Forgot Password error: " , error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

const resetPassword = async(req, res) => {
    try{
        const { token , newPassword } = req.body;
        
        if(!token || !newPassword){
            return res.status(404).json({
                success: false,
                message: "token an new Password are required"
            });
        }

        if(newPassword.length < 6){
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if(!user){
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);

        if(isSamePassword){
            return res.status(400).json({
                success: false ,
                message: "New password must be different from your current password"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword , 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    }catch(error){
        console.log("Reset Password error: " , error);

        return res.status(500).json({
            success: false ,
            message: "Internal server error"
        });
    }
};

module.exports = {
    signup,
    login,
    getme,
    forgotPassword,
    resetPassword
};