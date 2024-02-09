// sockets/communitySocket.js
const { Server } = require('socket.io');
import { client } from '../db/connect_db';
import { buildInsertQuery } from '../queries/insert_query';
import { getTheGroupMessagesByGroupID, totalMembersInGroup, getUserById } from '../queries/get_query';

export const handleCommunitySocket = (server) => {
    const io = server;

    io.on('connection', (socket) => {
        console.log('User connected to community:', socket.id);

        socket.on('joinCommunity', async (roomID, userId) => {
            console.log("User joined community:", userId, "Group ID:", roomID);
            socket.join(roomID);

            io.to(roomID).emit('userJoined', userId);

            const groupMessages = await client.query(getTheGroupMessagesByGroupID, [roomID]);

            const groupMessagesWithUserDetails = await Promise.all(groupMessages.rows.map(async (message) => {
                const user = await client.query(getUserById, [message.user_id]);
                const user_info = user.rows[0]
                return { ...message, user_info };
            }));
            console.log("datattat", groupMessagesWithUserDetails)


            const userCount = await client.query(totalMembersInGroup, [roomID]);
            io.to(roomID).emit('GroupMemberCount', userCount.rows.length)
            io.to(roomID).emit('receiveMessage', groupMessagesWithUserDetails);
        });

        socket.on('sendMessage', async (group_id, user_id, message, media_url) => {
            console.log("Message received:", message);

            try {
                const table = 'all_messages';
                const columns = { group_id, user_id, message, media_url };
                const { query, values } = buildInsertQuery(table, columns);
                const result = await client.query(query, values);

                const groupMessagesWithUserDetails = await Promise.all(result.rows.map(async (message) => {
                    const user = await client.query(getUserById, [message.user_id]);
                    const user_info = user.rows[0]
                    return { ...message, user_info };
                }));
                const newMessage = { ...groupMessagesWithUserDetails[0] }
                io.emit('new-message', newMessage);
                const userCount = await client.query(totalMembersInGroup, [group_id]);
                io.to(group_id).emit('GroupMemberCount', userCount.rows.length)
                console.log("after sending message", result.rows)
            } catch (error) {
                console.error('Error saving message to the database:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected from community');
        });
    });
};
