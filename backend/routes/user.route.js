import express from 'express';
import { login,signup,logout, purchases } from '../controllers/user.controller.js';
import { buyCourses } from '../controllers/course.controller.js';
import userMiddleware from '../middleware/user.mid.js';


const router = express.Router();


router.post('/signup', signup);
router.post("/login",login);
router.get('/logout', logout);
router.post("/buy/:courseId",buyCourses);
router.get("/purchases",userMiddleware,purchases);

export default router;