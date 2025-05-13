const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    // console.log(token)

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded; // now you can access req.user.id, req.user.email, etc.
        next();
    } catch (err) {
        console.log(err.message)
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
