const getAllUsersQuery = `
    SELECT * FROM users;
`;
const getUserBasedOnId = `
    SELECT * FROM users WHERE user_id = $1;
`;
const getUserByEmailId = ` SELECT * FROM users WHERE email = $1;`
const getUserById = ` SELECT * FROM users WHERE user_id = $1;`
const getAllPlansQuery = ` SELECT * FROM subscriptions`
const getPlansQueryById = ` SELECT * FROM subscriptions where plan_id = $1`
const getTheGroupQueryByID = `SELECT * FROM all_groups where group_id = $1`
const getUserGroupByUSerID = ` SELECT * FROM user_group where user_id = $1`
const getTheGroupMessagesByGroupID = `SELECT * FROM all_messages where group_id = $1`
const checkUserExistInGroup = ` SELECT * FROM user_group where user_id = $1 AND group_id = $2`
const getGroupById = ` SELECT * FROM all_groups where group_id = $1`
const totalMembersInGroup = ` SELECT * FROM user_group where group_id = $1`
export  { getAllUsersQuery , getUserBasedOnId , getUserByEmailId , getAllPlansQuery , getPlansQueryById , getTheGroupQueryByID , getUserGroupByUSerID , getTheGroupMessagesByGroupID , checkUserExistInGroup,totalMembersInGroup , getGroupById , getUserById }