import { client } from '../db/connect_db'
import { getUserBasedOnId } from '../queries/get_query';
const requireProPlan = async (req, res, next) => {
    const userId = req.query['userId'];
    const userPlan = await client.query(getUserBasedOnId, [userId]);

    if (!userPlan?.rows?.length) {
        res.status(400).json({ error: 'User not found.' });
        return
    }
    if (userPlan?.rows[0].plan_id < 2) {
        res.status(403).json({ error: 'Unauthorized. Upgrade to Pro plan.' });
        return
    }
    const subscriptionValid = await isSubscriptionValid(userPlan.rows[0]);
    if (!subscriptionValid) {
        res.status(403).json({ error: 'Unauthorized. Pro plan subscription expired.' });
        return
    }
    next()
};

const requireUltimatePlan = async (req, res, next) => {
    const userId = req.query['userId'];
    const userPlan = await client.query(getUserBasedOnId, [userId]);

    if (!userPlan?.rows?.length) {
        res.status(400).json({ error: 'User not found.' });
        return
    }
    if (userPlan?.rows[0].plan_id < 3) {
        res.status(403).json({ error: 'Unauthorized. Upgrade to Ultimate plan.' });
        return
    }
    const subscriptionValid = await isSubscriptionValid(userPlan.rows[0]);
    if (!subscriptionValid) {
        res.status(403).json({ error: 'Unauthorized. Ultimate plan subscription expired.' });
        return
    }
    next()
};
async function isSubscriptionValid(data) {
    const currentDateTime = new Date();
    const subscriptionDate = new Date(data.subscription_end_date);

    if (currentDateTime < subscriptionDate) return true;
    return false;
}
export { requireProPlan, requireUltimatePlan }