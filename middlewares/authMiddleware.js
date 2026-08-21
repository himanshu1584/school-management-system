const jwt = require("jsonwebtoken");

const SECRET_KEY = "school_secret_key";

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Access denied. No token provided."
        });
    }

    // Expecting format: "Bearer <token>"
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
}

module.exports = verifyToken;