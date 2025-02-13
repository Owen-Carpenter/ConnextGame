import express from 'express';
import handleNewUser from '../controllers/registerController.js';

const router = express.Router();

router.post('/', handleNewUser.register);

export default router;