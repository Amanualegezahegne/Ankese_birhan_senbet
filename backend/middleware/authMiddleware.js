const jwt = require('jsonwebtoken');
const { supabase } = require('../config/db');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token - Check both students and users (Admin) tables
            let { data: user, error } = await supabase
                .from('students')
                .select('*')
                .eq('id', decoded.id)
                .single();

            if (!user || error) {
                const { data: adminUser, error: adminError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', decoded.id)
                    .single();
                
                if (adminUser) user = adminUser;
            }

            if (!user) {
                return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }

            delete user.password;
            req.user = user;
            next();
        } catch (error) {
            console.error('Auth error:', error);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
};

const teacher = (req, res, next) => {
    if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin' || req.user.role === 'mezmure')) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as a teacher' });
    }
};

const mezmure = (req, res, next) => {
    if (req.user && (req.user.role === 'mezmure' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as mezmure' });
    }
};

module.exports = { protect, admin, teacher, mezmure };
