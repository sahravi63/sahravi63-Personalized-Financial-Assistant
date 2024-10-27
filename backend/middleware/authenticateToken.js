const jwt = require('jsonwebtoken');
const User = require('../db/User'); // Adjust the path as needed

const authenticateToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Adjust this line if needed

    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }

        // Fetch user from DB and attach to request
        try {
            req.user = await User.findById(user.id); // Ensure user.id exists
            if (!req.user) {
                return res.sendStatus(404); // User not found
            }
            next();
        } catch (error) {
            console.error('Error fetching user:', error);
            return res.sendStatus(500); // Internal server error
        }
    });
};

module.exports = authenticateToken;
