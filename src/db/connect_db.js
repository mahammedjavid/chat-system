// database.js
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const connectToDatabase = async () => {
    try {
        await client.connect();
//         const query = `
//        ALTER TABLE all_messages
// ALTER COLUMN media_url TYPE VARCHAR(700);
// `;
    
//     await client.query(query);
        console.log('Connected to PostgreSQL database!');
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
};

const closeDatabaseConnection = () => {
    client.end();
    console.log('Database connection closed');
};

export { connectToDatabase, client, closeDatabaseConnection };
