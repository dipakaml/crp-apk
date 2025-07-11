import { Course } from "../models/course.model.js";
import { Purchase } from "../models/purchase.model.js";
import { v2 as cloudinary } from 'cloudinary';

export const createCourse = async (req, res) => {
  const adminId = req.adminId;

  try {
    if (!req.body) {
      return res.status(400).json({ error: "Request body is missing" });
    }

    // ✅ Destructure these early
    const { title, description, price } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ error: "All fields (title, description, price) are required" });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const { image } = req.files;

    const allowedFormats = ["image/png", "image/jpeg"];
    if (!allowedFormats.includes(image.mimetype)) {
      return res.status(400).json({ error: "Invalid file format. Only PNG and JPG are allowed" });
    }

    const cloudResponse = await cloudinary.uploader.upload(image.tempFilePath);
    if (!cloudResponse || cloudResponse.error) {
      return res.status(500).json({ error: "Error uploading file to Cloudinary" });
    }

    const courseData = {
      title,
      description,
      price: Number(price),
      image: {
        public_id: cloudResponse.public_id,
        url: cloudResponse.secure_url
      },
      creatorId: adminId,
    };

    const course = await Course.create(courseData);

    res.status(201).json({
      message: "Course created successfully",
      course
    });

  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const updateCourse = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;
  const { title, description, price } = req.body;
  try {
    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    let imageData = {
      public_id: existingCourse.image.public_id,
      url: existingCourse.image.url
    };

    if (req.files && req.files.image) {
      const { image } = req.files;
      const allowedFormats = ["image/png", "image/jpeg"];
      if (!allowedFormats.includes(image.mimetype)) {
        return res.status(400).json({ error: "Invalid file format. Only PNG and JPG are allowed" });
      }

      const cloudResponse = await cloudinary.uploader.upload(image.tempFilePath);
      if (!cloudResponse || cloudResponse.error) {
        return res.status(500).json({ error: "Error uploading file to Cloudinary" });
      }

      imageData = {
        public_id: cloudResponse.public_id,
        url: cloudResponse.secure_url
      };
    }

    const course = await Course.updateOne(
      {
        _id: courseId,
        creatorId: adminId, // ✅ corrected field name
      },
      {
        title,
        description,
        price,
        image: imageData
      }
    );

  if (course.nModified === 0) {
  return res.status(404).json({ error: "Course not found or no changes made" });
}

    res.status(200).json({
      message: "Course updated successfully",
      course
    });
  } catch (error) {
    console.log("Error in course updating:", error);
    res.status(500).json({ error: `Error updating course: ${error.message}` });
  }
};

export const deleteCourse = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;
  try {
    const course = await Course.deleteOne({
      _id: courseId,
      creatorId: adminId, // ✅ corrected field name
    });

    if (course.deletedCount === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json({
      message: "Course deleted successfully"
    });
  } catch (error) {
    console.log("Error in course deletion", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.status(201).json({ courses });
  } catch (error) {
    res.status(500).json({ error: "Error in getting courses" });
    console.log("error to get courses", error);
  }
};

export const courseDetails = async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json({ course });
  } catch (error) {
    res.status(500).json({ error: "Error in getting course details" });
    console.log("error to get course details", error);
  }
};

export const buyCourses = async (req, res) => {
  const userId = req.user?.id || req.user?._id;
  const { courseId } = req.params;

  try {
    if (!userId) {
      return res.status(401).json({ error: 'User ID is missing. Please authenticate.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const existingPurchases = await Purchase.findOne({ userId, courseId });
    if (existingPurchases) {
      return res.status(400).json({ error: 'User has already purchased this course' });
    }

    const newPurchase = new Purchase({ userId, courseId });
    await newPurchase.save();

    res.status(200).json({ message: 'Course purchased successfully', newPurchase });
  } catch (error) {
    console.error('Error in buying course:', error.message);
    res.status(500).json({ error: 'Error in buying course', details: error.message });
  }
};
