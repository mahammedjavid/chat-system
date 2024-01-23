import { client } from "../db/connect_db";
const userTableSchema = `
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    password VARCHAR(255) NOT NULL,
    otp VARCHAR(6),
    plan_id INTEGER REFERENCES  subscriptions(plan_id),
    is_email_verified BOOLEAN DEFAULT false,
    subscription_end_date DATE
`

const addressTableSchema = `
    address_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL
`;
const subscriptionPlanSchema = `
    plan_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price VARCHAR(250) NOT NULL,
    duration_months INTEGER NOT NULL
`;

const create_table = async () => {
    await createTable(['users', 'address','subscriptions'], [userTableSchema, addressTableSchema , subscriptionPlanSchema]);
};

const createTable = async (tableNames, tableSchemas) => {
    try {
        for (let i = 0; i < tableNames.length; i++) {
            await client.query(`
                CREATE TABLE IF NOT EXISTS ${tableNames[i]} (
                    ${tableSchemas[i]}
                );
            `);
            console.log(`${tableNames[i]} table created or already exists.`);
        }
    } catch (error) {
        console.error('Error creating tables:', error);
    }
};


export { create_table };
