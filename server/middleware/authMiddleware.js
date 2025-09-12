const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const accessToken = authHeader && authHeader.split(" ")[1];

    if (!accessToken) {
        return res.status(401).json({ msg: "Token missing", loggedIn: false });
    }

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decodedUser) => {
        if (err) {
            let msg = "Invalid or expired token";
            if (err.name === "TokenExpiredError") msg = "Token expired";
            else if (err.name === "JsonWebTokenError") msg = "Malformed token";

            return res.status(401).json({ msg, loggedIn: false });
        }

        req.user = decodedUser; 
        next();
    });
}

module.exports = authenticateToken;
