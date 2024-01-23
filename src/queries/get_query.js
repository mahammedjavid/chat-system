const getAllUsersQuery = `
    SELECT * FROM users;
`;
const getUserBasedOnId = `
    SELECT * FROM users WHERE user_id = $1;
`;
const getUserByEmailId = ` SELECT * FROM users WHERE email = $1;`
const getAllPlansQuery = ` SELECT * FROM subscriptions`
const getPlansQueryById = ` SELECT * FROM subscriptions where plan_id = $1`
export  { getAllUsersQuery , getUserBasedOnId , getUserByEmailId , getAllPlansQuery , getPlansQueryById }