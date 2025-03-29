import express from 'express';
import paymentController from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Create checkout session
router.post('/create-checkout-session', paymentController.createCheckoutSession);

// Handle payment success
router.get('/success', verifyToken, paymentController.handlePaymentSuccess);

// Get subscription status
router.get('/subscription-status', paymentController.getSubscriptionStatus);

export default router;