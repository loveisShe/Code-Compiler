const jwt = require("jsonwebtoken");
const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check whether token exists
        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please login."
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user information to request
        const userId = decoded.id || decoded.userId || decoded._id;
        if(!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });
        }

        req.user = {
            id: userId
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = protect;