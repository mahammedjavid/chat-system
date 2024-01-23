const updatePlan = `
            UPDATE users
            SET plan_id = $1
            WHERE user_id = $2`
const updateUserPlanInfo = `UPDATE users
            SET subscription_end_date = $1
            WHERE user_id = $2`
export { updatePlan, updateUserPlanInfo };
