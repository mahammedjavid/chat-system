import { client } from "../db/connect_db";
import { getUserBasedOnId } from "../queries/get_query";
import {updatePlan } from "../queries/update_query";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe = require('stripe')(stripeSecretKey);
const handleFreeSubscription = async (userId, planId) => {
  try {

      // Update the plan_id
      const updatedUser = await client.query(updatePlan , [planId , userId]);

      console.log(`User ${userId} subscribed to free plan (${planId})`);
      return updatedUser.rows[0];
  } catch (error) {
      console.error('Error handling free subscription:', error);
      return null;
  }
};
  
  // Step 3-5: Handle Paid Subscription using Stripe Checkout
  const handlePaidSubscription = async (userId, planId , plan) => {
    try {
      const price = await plan.rows[0].price 
      const plan_duration = await plan.rows[0].duration_months; 
      // Create a Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price ,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        metadata: {
          user_id: userId,
          plan_id: planId,
          plan_duration
      },
      success_url : 'https://youtube.com'
      });
  
      // Redirect the user to the Stripe Checkout page
      // You can send the session ID to the client to use for redirection
      console.log(`Redirect user to Stripe Checkout: ${session.id} user is ${userId} and plan is id ${planId}`,);
      return { sessionId: session.id };
    } catch (error) {
      console.error('Error creating Checkout Session:', error);
    }
  };
  export { handleFreeSubscription ,handlePaidSubscription }