import express from "express";
import dotenv from "dotenv";
import cors from "cors";               // ← must be here
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";
import courseRoute from "./routes/course.route.js";
import userRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js";
import cookieParser from "cookie-parser";


const app = express();
dotenv.config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // ✅ Add this line
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: './tmp/' // Ensure ./tmp/ directory exists
}));

// Routes
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/admin",adminRoute);

// Test database connection route
app.get('/test-db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ message: 'Database connected' });
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});

app.use(cors({
  origin:process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  
}));


const port = process.env.PORT || 5000;
const DB_URI = process.env.MONGO_URI;

const startServer = async () => {
  try {
    console.log("Connecting to MongoDB with URI:", DB_URI.replace(/:([^@]+)@/, ':****@'));
    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
      bufferCommands: false
    });
    console.log("Connected to MongoDB Atlas");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

startServer();
