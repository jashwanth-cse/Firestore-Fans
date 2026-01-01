const admin = require('firebase-admin');

/**
 * Middleware to verify Firebase ID token
 * Attaches user data to req.user if token is valid
 */
const verifyToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided. Include Authorization: Bearer <token> header',
            });
        }

        const token = authHeader.split('Bearer ')[1];

        // Verify token with Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Fetch user data from Firestore
        const userDoc = await admin.firestore()
            .collection('users')
            .doc(decodedToken.uid)
            .get();

        if (!userDoc.exists) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User document does not exist in Firestore',
            });
        }

        // Attach user data to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            ...userDoc.data(),
        };

        next();
    } catch (error) {
        console.error('Token verification error:', error);

        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Your session has expired. Please login again',
            });
        }

        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired token',
        });
    }
};

module.exports = { verifyToken };
