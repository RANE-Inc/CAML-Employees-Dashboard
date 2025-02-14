import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const token = req.cookies.accessToken; // Read from cookies

    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, 'access_secret'); // Verify access token
        req.user = verified; // Store user info in `req.user`
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};


export const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }
    next();
};
