const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
    try {

        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {

            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decoded;

            next();

        } else {

            return res.status(401).json({
                success: false,
                message: "Not authorized. No token found.",
            });

        }

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid token.",
        });

    }
};

module.exports = protect;