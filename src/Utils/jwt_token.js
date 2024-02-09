import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ACCESSTOKENSECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESHTOKENSECRET;

/**
 * Generate an access token for the user
 * @param {object} user 
 * @returns {string} Access token
 */
const generateAccessToken = (user) => {
    console.log("sssssssssssssssssssssss",user)
    return jwt.sign({ user_id: user.user_id, email: user.email }, JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

/**
 * Generate a refresh token for the user
 * @param {object} user 
 * @returns {string} Refresh token
 */
const generateRefreshToken = (user) => {
    return jwt.sign({ user_id: user.user_id }, REFRESH_TOKEN_SECRET, {
        expiresIn: '7d', // Refresh token expires in 7 days
    });
};

/**
 * Extract user information from the access token
 * @param {string} accessToken 
 * @returns {object|null} User information or null if invalid token
 */
const getUserFromToken = (accessToken) => {
    try {
        const decoded = jwt.verify(accessToken, JWT_SECRET);
        console.log(decoded)
        return decoded;
    } catch (error) {
        console.log(error)
        return null;
    }
};

export { generateAccessToken, generateRefreshToken, getUserFromToken };
