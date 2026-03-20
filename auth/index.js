const jwt = require('jsonwebtoken')
const User = require("../models/user")

const secret = process.env.JWT_SECRET

exports.decodeToken = async (req, res, next) => {
    try {
        const token = req.headers?.authorization?.split(" ")[1]
        res.locals.user = await jwt.verify(token, secret)
        next()
    } catch (err) {
        console.log(err)
        next()
    }
}

exports.userAuth = ({permission = "", isAdmin = false, isUser = false, isAccountant = false, isAuth = false}) => async (req, res, next) => {
    try {
        const token = req.headers?.authorization?.split(" ")[1];
        let decode = await jwt.verify(token, process.env.JWT_SECRET);
        // @ts-ignore
        let user = await User.findById(decode.id, "role permission").populate("permission");
        res.locals.user = user;
        const userRoles = ['admin', 'user', 'accountant', 'employee']
        if (isAdmin && user.role === "admin") {
            next();
            return;
        } else if (isUser && user.role === "user") {
            next();
            return;
        } else if (isAccountant && user.role === "accountant") {
            next();
            return;
        } else if (userRoles.includes(user.role) && isAuth) {
            next();
            return;
        } else if (havePermission(permission, user.permission)) {
            next()
            return
        }
        return res.status(401).send({
            error: true,
            msg: "Unauthorized access",
        });
    } catch (err) {
        return res.status(401).send({
            error: true,
            msg: "Server error",
        });
    }
};

exports.havePermission = (permission, roles) => {
    for (let role of roles || []) {
        if (role.permissions.includes(permission)) {
            return true
        }
    }
    return false
}