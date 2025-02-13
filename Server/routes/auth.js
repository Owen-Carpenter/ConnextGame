import express from "express";
import handleLogin from "../controllers/authController.js";

const router = express.Router();

router.post('/', handleLogin.login);

export default router;
