const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Env_variables = require('../models/env_variable');

exports.protect = async (req, res, next) => {
    try {
        let token;
        const { authorization } = req.headers;
        if (authorization && authorization.startsWith('Bearer')) {
            token = authorization.split(' ')[1];
        } else {
            return res.status(401).json({
                message: 'Authentication failed!',
                status: false,
            })
        }
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        if (decoded?.id) {
            const user = await User.findOne({ _id: decoded.id });
            if (!!user) {
                res.locals.user = { id: user._id, role: user.role, email: user.email };
                next();
            } else {
                return res.status(404).json({
                    status: 'Authentication failed! User not found',
                })
            }
        }
    } catch (error) {
        return res.status(401).json({
            message: 'Authentication failed!',
            status: false,
            error
        })
    }
}
