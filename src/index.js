import app from './app';
import config from './config';
import { connectToDatabase, closeDatabaseConnection } from './db/connect_db';
import { create_table } from './queries/create_query';

const startServer = async () => {
    try {
        await connectToDatabase();

        await create_table();

        app.listen(config.port, () => {
            console.log(`${config.name} ${config.version}`);
            console.log(`Listening on ${config.port} with NODE_ENV=${config.nodeEnv}`);
        });
    } catch (error) {
        console.error('Error during startup:', error);
    } finally {
        // closeDatabaseConnection();
    }
};

startServer();
