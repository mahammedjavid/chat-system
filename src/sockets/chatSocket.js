export const handleChatSocket = (io) => {
    io.of('/chat').on('connection', (socket) => {
        // Handle chat-related socket events
        console.log('User connected to chat');
        // Add more socket event handlers for chat
    });
};
