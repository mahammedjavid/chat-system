import { client } from "../db/connect_db";
import { getUserBasedOnId ,checkUserExistInGroup } from "../queries/get_query";
import {updatePlan } from "../queries/update_query";
import { buildInsertQuery } from '../queries/insert_query';


const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe = require('stripe')(stripeSecretKey);
const handleFreeSubscription = async (userId, planId , userName) => {
  try {
    const techGroup_id = 1
      // Update the plan_id
      const updatedUser = await client.query(updatePlan , [planId , userId]);

      //adding tech group to theer profile
      const userExistInSelectedGroup = await client.query(checkUserExistInGroup , [userId,techGroup_id])
      if(!userExistInSelectedGroup.rows.length){
        const table = 'user_group'
        const columns = {
          group_id : techGroup_id ,
          user_id : userId,
          user_role : 'MEMBER',
        }
        const { query, values } = buildInsertQuery(table, columns);
        const result = await client.query(query, values);
        console.log(`User ${userId} subscribed to free plan (${planId}) username is ${userName}`);
        addGroupJoinedMessage(techGroup_id,userName)
      }
      return updatedUser.rows[0];
  } catch (error) {
      console.error('Error handling free subscription:', error);
      return null;
  }
};
  
  // Step 3-5: Handle Paid Subscription using Stripe Checkout
  const handlePaidSubscription = async (userId, planId, plan , userName) => {
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
          plan_duration,
          user_name : userName
      },
      success_url : `http://localhost:7777/_plans/${planId}`,
      });
  
      // Redirect the user to the Stripe Checkout page
      // You can send the session ID to the client to use for redirection
      console.log(`Redirect user to Stripe Checkout: ${session.id} user is ${userId} and plan is id ${planId}`,);
      return { sessionId: session.id };
    } catch (error) {
      console.error('Error creating Checkout Session:', error);
    }
  };
  const addGroupJoinedMessage = async (group_id , userName) => {
    console.log("userName is ", userName)
    const message = `${userName} Joined the Group`
    const table = 'all_messages';
    const columns = { group_id , message };
    const { query, values } = buildInsertQuery(table, columns);
    const result = await client.query(query, values);

  }
  export { handleFreeSubscription ,handlePaidSubscription , addGroupJoinedMessage }