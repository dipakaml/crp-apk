import express from 'express';
import { login, logout, signup } from '../controllers/admin.controller.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);  // Changed from GET to POST for logout

export default router;