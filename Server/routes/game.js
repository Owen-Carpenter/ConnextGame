import express from "express";
import handleGame from "../controllers/gameController.js";

const router = express.Router();

router.post('/', handleGame);

export default router;
