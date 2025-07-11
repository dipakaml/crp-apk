import Admin from "../models/admin.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import config from '../config.js';

export const signup = async (req, res) => {
  const adminSchema = z.object({
    firstName: z.string().min(3, { message: "First name must be at least 3 characters long" }),
    lastName: z.string().min(3, { message: "Last name must be at least 3 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" })
  });

  try {
    const validatedData = adminSchema.parse(req.body);
    const { firstName, lastName, email, password } = validatedData;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({ 
      firstName, 
      lastName, 
      email, 
      password: hashedPassword 
    });
    
    await newAdmin.save();

    // Remove password before sending response
    const adminResponse = {
      _id: newAdmin._id,
      firstName: newAdmin.firstName,
      lastName: newAdmin.lastName,
      email: newAdmin.email,
      createdAt: newAdmin.createdAt,
      updatedAt: newAdmin.updatedAt
    };

    res.status(201).json({ 
      success: true,
      message: "Admin created successfully", 
      admin: adminResponse 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        errors: error.errors.map(err => err.message) 
      });
    }
    console.error("Error in admin signup:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid credentials" 
      });
    }

    // Compare passwords
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid credentials" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      config.JWT_ADMIN_PASSWORD,
      { expiresIn: "1d" }
    );

    // Set cookie options
    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax"
    };

    // Set cookie
    res.cookie("admin_jwt", token, cookieOptions);

    // Remove password before sending response
    const adminResponse = {
      _id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email
    };

    res.status(200).json({ 
      success: true,
      message: "Logged in successfully", 
      admin: adminResponse, 
      token 
    });

  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
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
    
    res.clearCookie("admin_jwt");
    res.status(200).json({ 
      success: true,
      message: "Logged out successfully" 
    });
  } catch (error) {
    console.error("Error in admin logout:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
};