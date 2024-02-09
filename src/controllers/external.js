import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../Utils/jwt_token';
const refreshAccessToken = (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token; // Assuming the refresh token is stored in a cookie

        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESHTOKENSECRET);

        // Check if the decoded token is valid
        if (decoded) {
            console.log("xxxxxxxx",decoded)
            // Generate a new access token
            const newAccessToken = generateAccessToken(decoded);

            // Send the new access token back to the client
            res.status(200).json({ access_token: newAccessToken });
        } else {
            res.status(401).json({ message: 'Invalid refresh token' });
        }
    } catch (error) {
        console.error('Error refreshing access token:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const calculateSubscriptionEndDate = (startDate, durationMonths) => {
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);
    return endDate?.toISOString()?.split('T')[0]; 
};
export { refreshAccessToken , calculateSubscriptionEndDate}