import bcrypt from 'bcrypt';
import { client } from '../db/connect_db'
import { buildInsertQuery } from '../queries/insert_query';
import { getAllUsersQuery, getUserBasedOnId, getUserByEmailId } from '../queries/get_query'
import { generateAccessToken, generateRefreshToken, getUserFromToken } from '../Utils/jwt_token';

/**
 * Echo endpoint
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
const createUser = async (req, res) => {
    try {
        const table = 'users';
        const columns = req.body;
        const userexist = await client.query(getUserByEmailId, [columns.email])
        if (userexist.rows.length) {
            res.status(400).json({ message: 'User already exist' });
            return
        }

        if (columns.password) {
            columns.password = await bcrypt.hash(columns.password, 10);
        }

        if (columns.dob) {
            const [day, month, year] = columns.dob.split('-');
            columns.dob = new Date(`${year}-${month}-${day}`);
        }

        const { query, values } = buildInsertQuery(table, columns);

        const result = await client.query(query, values);

        const newUser = result.rows[0];

        const accessToken = generateAccessToken(newUser);

        const refreshToken = generateRefreshToken(newUser);

        res.cookie('refresh_token', refreshToken, { httpOnly: true });

        res.status(201).json({ user: newUser, accessToken, refreshToken });

    } catch (error) {
        console.error('Error creating user:', error);

        res.status(500).json({ message: 'Internal server error' });
    }
};
const loginUser = async (req, res) => {
    try {
        const columns = req.body;
        const userExist = await client.query(getUserByEmailId, [columns.email]);

        if (!userExist.rows.length) {
            res.status(400).json({ message: 'User not exist' });
            return;
        }

        const user = userExist.rows[0];

        const isPasswordValid = await bcrypt.compare(columns.password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid password' });
            return;
        }

        // If password is valid, generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Set the refresh token as an HTTP-only cookie
        res.cookie('refresh_token', refreshToken, { httpOnly: true });

        res.status(201).json({ user, accessToken, refreshToken });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getUser = async (_req, res) => {
    try {
        const result = await client.query(getAllUsersQuery);

        const user = result.rows;
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        console.log(accessToken)
        if (!accessToken) {
            res.status(401).json({ message: 'Access token not provided' });
            return;
        }


        const user_id = getUserFromToken(accessToken)?.user_id;
        console.log(getUserFromToken(accessToken))
        const userInfo = (await client.query(getUserBasedOnId, [user_id])).rows;
        if (!userInfo) {
            res.status(401).json({ message: 'Invalid access token' });
            return;
        }

        res.status(200).json(userInfo);
    } catch (error) {
        console.error('Error getting user info from access token:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export { createUser, getUser, getCurrentUser, loginUser }