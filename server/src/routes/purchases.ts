import { Router, Request, Response } from 'express';
import { query } from '../db/index.js';

const router = Router();

// Record a purchase and add credits
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, stripeSessionId, planType, creditsAdded, amountPaidCents } = req.body;
    
    if (!userId || !planType || !creditsAdded || !amountPaidCents) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, planType, creditsAdded, amountPaidCents' 
      });
    }

    // Get user
    const userResult = await query(
      'SELECT id, credits FROM users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const newCredits = user.credits + creditsAdded;

    // Start transaction
    await query('BEGIN');

    try {
      // Record purchase
      const purchaseResult = await query(
        `INSERT INTO purchases (user_id, stripe_session_id, plan_type, credits_added, amount_paid_cents)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, created_at`,
        [user.id, stripeSessionId || null, planType, creditsAdded, amountPaidCents]
      );

      // Update user credits
      await query(
        'UPDATE users SET credits = $1 WHERE id = $2',
        [newCredits, user.id]
      );

      // Record credit transaction
      await query(
        `INSERT INTO credit_transactions (user_id, amount, transaction_type, reference_id)
         VALUES ($1, $2, 'purchase', $3)`,
        [user.id, creditsAdded, purchaseResult.rows[0].id]
      );

      await query('COMMIT');

      res.json({
        success: true,
        credits: newCredits,
        purchaseId: purchaseResult.rows[0].id
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error: any) {
    console.error('Record purchase error:', error);
    res.status(500).json({ error: 'Failed to record purchase' });
  }
});

// Verify Stripe session and process purchase
router.post('/verify-stripe', async (req: Request, res: Response) => {
  try {
    const { sessionId, userId } = req.body;
    
    if (!sessionId || !userId) {
      return res.status(400).json({ error: 'sessionId and userId are required' });
    }

    // Check if purchase already processed
    const existingPurchase = await query(
      'SELECT id FROM purchases WHERE stripe_session_id = $1',
      [sessionId]
    );

    if (existingPurchase.rows.length > 0) {
      return res.status(409).json({ error: 'Purchase already processed' });
    }

    // In production, you would verify the session with Stripe API here
    // For now, we'll assume the frontend has verified it
    // You should add Stripe SDK verification:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({ 
      message: 'Purchase verification endpoint - implement Stripe verification',
      note: 'Add Stripe SDK to verify session before processing'
    });
  } catch (error: any) {
    console.error('Verify purchase error:', error);
    res.status(500).json({ error: 'Failed to verify purchase' });
  }
});

export default router;
