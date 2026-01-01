/**
 * Middleware to verify user has admin role
 * Must be used AFTER authMiddleware.verifyToken
 */
const verifyAdmin = async (req, res, next) => {
    try {
        // Check if user data is attached (verifyToken must run first)
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }

        // Check if user has admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Admin access required',
            });
        }

        next();
    } catch (error) {
        console.error('Admin verification error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to verify admin status',
        });
    }
};

module.exports = { verifyAdmin };
