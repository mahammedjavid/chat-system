const { client } = require('../db/connect_db');
import { getUserGroupByUSerID, getUserBasedOnId, getGroupById, totalMembersInGroup } from '../queries/get_query'
import { buildInsertQuery } from '../queries/insert_query';
import { addGroupJoinedMessage } from '../services/subscriptions'

/**
 * Echo endpoint
 * @param {import('express').Request} _req 
 * @param {import('express').Response} res 
 */

const getUserGroups = async (_req, res) => {
    try {
        const user_id = _req.query.user_id
        const user = await client.query(getUserBasedOnId, [user_id]);
        console.log("User is ", user_id)
        if (user.rows.length === 0) {
            console.error(`User ${user_id} not found.`);
            return res.status(500).json({ message: 'User not found' });
        }
        const allUserGroups = await client.query(getUserGroupByUSerID, [user_id]);
        const userGroups = allUserGroups.rows;

        // Fetch group details for each user group
        const userGroupsWithDetails = await Promise.all(userGroups.map(async (userGroup) => {
            const group = await client.query(getGroupById, [userGroup.group_id]);
            const group_info = group.rows[0]
            const userCount = (await client.query(totalMembersInGroup, [userGroup.group_id])).rows.length;
            group_info['total_members'] = userCount
            return { ...userGroup, group_info };
        }));

        res.status(200).json(userGroupsWithDetails);
    } catch (error) {
        console.error('Error groups plans:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const creategroup = async (_req, res) => {
    console.log("group nma is ", _req.body)

    try {
        const table = 'all_groups'
        const columns = {
            group_name: _req.body.group_name
        }
        const { query, values } = buildInsertQuery(table, columns);
        const result = await client.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Internal server error' });

    }
}

const addUserToGroup = async (_req, res) => {

    try {
        const table = 'user_group'
        const all_users = _req.body
        all_users.forEach(async element => {
            const columns = {
                group_id: element.group_id,
                user_id: element.user_id,
                user_role: 'Member'
            }
            const { query, values } = buildInsertQuery(table, columns);
            const result = await client.query(query, values);


        });
        addGroupJoinedMessage(all_users[0].group_id, all_users.map((user) => user.user_name).join(','))

        res.status(201).json({ message: 'User added to the group successfully' });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Internal server error' });

    }
}
export { getUserGroups, creategroup, addUserToGroup }