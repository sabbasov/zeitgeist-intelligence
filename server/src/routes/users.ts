import { Router, Request, Response } from 'express';
import { query } from '../db/index.js';

const router = Router();

const INITIAL_FREE_CREDITS = 25;

// Get or create user by email
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const existingUser = await query(
      'SELECT id, email, user_id, credits FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    let user;
    
    if (existingUser.rows.length > 0) {
      user = existingUser.rows[0];
    } else {
      // Create new user
      const userId = `usr_${Buffer.from(email).toString('base64').substring(0, 12)}`;
      
      const newUser = await query(
        `INSERT INTO users (email, user_id, credits) 
         VALUES ($1, $2, $3) 
         RETURNING id, email, user_id, credits`,
        [email.toLowerCase(), userId, INITIAL_FREE_CREDITS]
      );
      
      user = newUser.rows[0];
      
      // Record initial credits transaction
      await query(
        `INSERT INTO credit_transactions (user_id, amount, transaction_type, reference_id)
         VALUES ($1, $2, 'initial', 'system')`,
        [user.id, INITIAL_FREE_CREDITS]
      );
    }

    res.json({
      id: user.id,
      email: user.email,
      userId: user.user_id,
      credits: user.credits,
      isLoggedIn: true
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
});

// Get user by email
router.get('/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    
    const result = await query(
      'SELECT id, email, user_id, credits FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      userId: user.user_id,
      credits: user.credits,
      isLoggedIn: true
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user credits
router.patch('/:userId/credits', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { amount, transactionType = 'analysis', referenceId } = req.body;
    
    if (typeof amount !== 'number') {
      return res.status(400).json({ error: 'Amount is required and must be a number' });
    }

    // Get current user
    const userResult = await query(
      'SELECT id, credits FROM users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const newCredits = user.credits + amount;

    if (newCredits < 0) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }

    // Update credits
    await query(
      'UPDATE users SET credits = $1 WHERE id = $2',
      [newCredits, user.id]
    );

    // Record transaction
    await query(
      `INSERT INTO credit_transactions (user_id, amount, transaction_type, reference_id)
       VALUES ($1, $2, $3, $4)`,
      [user.id, amount, transactionType, referenceId || null]
    );

    res.json({ credits: newCredits });
  } catch (error: any) {
    console.error('Update credits error:', error);
    res.status(500).json({ error: 'Failed to update credits' });
  }
});

// Get user purchase history
router.get('/:userId/purchases', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const userResult = await query(
      'SELECT id FROM users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const purchases = await query(
      `SELECT id, plan_type, credits_added, amount_paid_cents, currency, created_at
       FROM purchases 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userResult.rows[0].id]
    );

    res.json(purchases.rows);
  } catch (error: any) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

export default router;
