import { User } from "../models/user.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import dotenv from 'dotenv';
import config from '../config.js';
import { Purchase } from "../models/purchase.model.js";
import { Course } from "../models/course.model.js";

// Load environment variables
dotenv.config();

export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const userSchema = z.object({
    firstName: z.string().min(3, { message: "firstName must be at least 3 characters long" }),
    lastName: z.string().min(3, { message: "lastName must be at least 3 characters long" }),
    email: z.string().email(),
    password: z.string().min(6, { message: "password must be at least 8 characters long" })
  });

  const validateData = userSchema.safeParse(req.body);

  if (!validateData.success) {
    return res.status(400).json({ errors: validateData.error.issues.map(err => err.message) });
  }

  try {
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All fields (firstName, lastName, email, password) are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ firstName, lastName, email, password: hashedPassword });
    await newUser.save();

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = newUser.toObject();
    res.status(201).json({ message: "User created successfully", user: userWithoutPassword });
  } catch (error) {
    console.log("Error in signup:", error);
    res.status(500).json({ error: `Error creating user: ${error.message}` });
  }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!user || !isPasswordCorrect) {
           return res.status(401).json({ error: "Invalid credentials" });
        }
        
        // JWT code
        const token = jwt.sign(
            { id: user._id },
            config.JWT_USER_PASSWORD,
            { expiresIn: "1d" }
        );
        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax" // Corrected: Changed from "Strict" to "Lax"
        }; 

        res.cookie("jwt", token, cookieOptions);

        res.status(201).json({ message: "Logged in successfully", user, token });
    } catch (error) {
        console.log("error in login:", error);
        res.status(500).json({ error: `Error logging in: ${error.message}` });
    }
};

export const logout = (req, res) => {
  try {
    if (!req.cookies.admin_jwt) {
      return res.status(400).json({ 
        success: false,
        error: "Not logged in" 
      });
    }
    
    res.clearCookie("user_jwt");
    res.status(200).json({ 
      success: true,
      message: "Logged out successfully" 
    });
  } catch (error) {
    console.error("Error in user logout:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
};

export const purchases = async (req, res) => {
  if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required: No user found" });
  }
  const userId = req.user.id;
  try {
      const purchased = await Purchase.find({ userId });

      let purchasedCourseId = [];
      for (let i = 0; i < purchased.length; i++) {
          purchasedCourseId.push(purchased[i].courseId);
      }
      const courseData = await Course.find({
          _id: { $in: purchasedCourseId }
      });

      res.status(200).json({ purchased, courseData });
  } catch (error) {
      console.log("Error in purchases:", error);
      res.status(500).json({ error: `Error fetching purchases: ${error.message}` });
  }
};