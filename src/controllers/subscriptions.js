import { updatePlan, updateUserPlanInfo } from '../queries/update_query';
import { calculateSubscriptionEndDate } from './external';
import { buildInsertQuery } from '../queries/insert_query';
const { handleFreeSubscription, handlePaidSubscription , addGroupJoinedMessage } = require('../services/subscriptions')
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const endpointSecret = process.env.WEBHOOK_SECRET_KEY;
const stripe = require('stripe');
const stripeClient = new stripe(stripeSecretKey);
const { client } = require('../db/connect_db');
const { getAllPlansQuery, getPlansQueryById, getUserBasedOnId, getTheGroupQueryByID , checkUserExistInGroup } = require('../queries/get_query');

/**
 * Echo endpoint
 * @param {import('express').Request} _req 
 * @param {import('express').Response} res 
 */

const getAllPlans = async (_req, res) => {
    try {
        const all_plans = await client.query(getAllPlansQuery);
        const plans = all_plans.rows;
        res.status(200).json(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const mapThePlansToUser = async (_req, res) => {
    try {
        const { userId, plan_id, group_id } = _req.body;
        const user = await client.query(getUserBasedOnId, [userId]);

        if (user.rows.length === 0) {
            console.error(`User ${userId} not found.`);
            return res.status(500).json({ message: 'User not found' });
        }

        const plan = await client.query(getPlansQueryById, [plan_id]);

        if (plan.rows.length === 0) {
            return res.status(500).json({ message: 'Plan not found' });
        }

        const group = await client.query(getTheGroupQueryByID, [group_id]);

        if (group.rows.length === 0) {
            return res.status(500).json({ message: 'Group not found' });
        }

        const userName = user.rows[0].name
        if (plan_id === 1) {
            const userInfo = await handleFreeSubscription(userId, plan_id ,userName);
            return res.status(200).json({ data: userInfo, message: 'Plan mapped to user successfully' });
        } else {
            const start_date = new Date()
            const { sessionId, error } = await handlePaidSubscription(userId, plan_id, plan ,userName);


            if (error) {
                return res.status(500).json({ error });
            }

            return res.status(200).json({ sessionId });
        }
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const checkOutPage = async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log("session id ", sessionId)
        const session = await stripeClient.checkout.sessions.retrieve(sessionId);
        res.json({ url: session.url });
    } catch (error) {
        console.error('Error retrieving Checkout Session:', error);
        res.status(500).send('Internal server error');
    }
};
const checkPaymentStatus = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event = req.body

    // try {
    //     event = await stripeClient.webhooks.constructEvent(req.body, sig, endpointSecret);
    //     console.log("event" , event.type)
    //     console.log("777777777",event.data)
    // } catch (err) {
    //     console.log("errororororoorororoooror",sig)
    //     res.status(400).send(`Webhook Error: ${err.message}`);
    //     return;
    // }


    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            // const paymentIntentSucceeded = event.data.object;
            break;
        case 'checkout.session.completed':
            const techGroup_id = 1
            console.log("data is , ", event)
            const session = event.data.object;
            const userId = session.metadata.user_id;
            const planId = session.metadata.plan_id;
            const userName = session.metadata.user_name;
            // const group_id = session.metadata.group_id
            const plan_duration = session.metadata.plan_duration
            const start_date = new Date()
            const subscriptionEndDate = calculateSubscriptionEndDate(start_date, plan_duration);

            await client.query(updateUserPlanInfo, [subscriptionEndDate, userId]);
            await client.query(updatePlan, [planId, userId])
            console.log(`User ${userId} subscribed to free plan (${planId}) username is ${userName}`);
            //adding tech group to theer profile
            const userExistInSelectedGroup = await client.query(checkUserExistInGroup , [userId ,techGroup_id])
            console.log("checking user  group status",userExistInSelectedGroup)
            console.log("user- name " , userName)
            if(!userExistInSelectedGroup.rows.length){
                const table = 'user_group'
                const columns = {
                    group_id: techGroup_id,
                    user_id: userId,
                    user_role: 'MEMBER',
                }
              const { query, values } = buildInsertQuery(table, columns);
              const result = await client.query(query, values);
              addGroupJoinedMessage(techGroup_id,userName)
            }

            break;

        default:

            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ message: 'success' });
};

export { getAllPlans, mapThePlansToUser, checkOutPage, checkPaymentStatus }