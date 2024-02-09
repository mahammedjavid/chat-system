import http from 'http';
import { Server } from 'socket.io';
import config from '../config';
import { handleChatSocket } from './chatSocket';
import { handleCommunitySocket } from './communitySocket';

export const initializeSockets = (server) => {
    const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'HEAD','POST'] } });

    // handleChatSocket(io);
    handleCommunitySocket(io);

    return io;
};

export const startSocketServer = () => {
    const server = http.createServer();
    const io = initializeSockets(server);

    server.listen(config.socketPort, () => {
        console.log(`Socket server listening on ${config.socketPort}`);
    });

    return io;
};
