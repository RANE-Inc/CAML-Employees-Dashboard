import api from "./axiosInstance";
const jwt = require('jsonwebtoken');

export const login = async (username, password) => {
    const response = await api.post("/login", { username, password });
    return response.data;
};

  // Middleware to check for the required role
const checkRole = (requiredRole) => {
    return (req, res, next) => {
      const token = req.cookies.authToken;
      if (!token) return res.status(401).json({ message: 'Not authenticated' });
  
      try {
        const decoded = jwt.verify(token, 'secret');
        req.user = decoded; // Store the decoded token in req.user
        if (req.user.role !== requiredRole) {
          return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
        }
        next(); // Proceed if the role matches
      } catch (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
    };
  };
  
  // Example of a protected route
  app.get('/check-auth', checkRole('admin'), (req, res) => {
    res.json({ message: 'Welcome Admin' });
  });

export const logout = async () => {
    await api.post("/logout");
};