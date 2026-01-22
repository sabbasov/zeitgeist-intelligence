import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Identity Protocol will be offline.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  email: string;
  user_id: string; // Matches your SQL 'user_id' column
  credits: number;
}

export interface PurchaseData {
  userId: string; // The UUID 'id' from the users table
  stripeSessionId?: string;
  planType: 'starter' | 'pro';
  creditsAdded: number;
  amountPaidCents: number;
}

class ApiService {
  /**
   * IDENTITY PROTOCOL: Handles login and user registration
   */
  async login(email: string): Promise<User> {
    // 1. Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code === 'PGRST116') {
      // 2. User not found, create a new record
      const newUserIdStr = 'usr_' + Math.random().toString(36).substr(2, 9);
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ 
          email: email, 
          user_id: newUserIdStr, 
          credits: 25 
        }])
        .select()
        .single();

      if (createError) throw createError;
      return newUser;
    }

    if (error) throw error;
    return user;
  }

  async getUser(email: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * LIQUIDITY ENGINE: Deducts credits and records the transaction
   */
  async updateCredits(
    userId: string, // Use the user_id string from your state
    amount: number,
    transactionType: string = 'analysis',
    referenceId?: string
  ): Promise<{ credits: number }> {
    // 1. Get current credits for the user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, credits')
      .eq('user_id', userId)
      .single();

    if (fetchError || !user) throw new Error("User not found in registry");

    const newCreditTotal = user.credits + amount;

    // 2. Update user credits
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newCreditTotal })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // 3. Record the transaction for the audit trail
    await supabase
      .from('credit_transactions')
      .insert([{
        user_id: user.id, // The UUID reference
        amount: amount,
        transaction_type: transactionType,
        reference_id: referenceId
      }]);

    return { credits: newCreditTotal };
  }

  /**
   * SETTLEMENT: Records Stripe purchases
   */
  async recordPurchase(data: PurchaseData): Promise<{ success: boolean; credits: number }> {
    // 1. Get the internal UUID for the user
    const { data: user } = await supabase
      .from('users')
      .select('id, credits')
      .eq('user_id', data.userId)
      .single();

    if (!user) throw new Error("Executive node not found");

    // 2. Add purchase record
    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert([{
        user_id: user.id,
        stripe_session_id: data.stripeSessionId,
        plan_type: data.planType,
        credits_added: data.creditsAdded,
        amount_paid_cents: data.amountPaidCents
      }]);

    if (purchaseError) throw purchaseError;

    // 3. Update credits
    const result = await this.updateCredits(data.userId, data.creditsAdded, 'purchase', data.stripeSessionId);

    return { success: true, credits: result.credits };
  }
}

export const apiService = new ApiService();