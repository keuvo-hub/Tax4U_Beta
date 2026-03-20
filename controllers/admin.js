const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/user");
const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const Department = require("../models/department.model");
const Role = require("../models/role");

// create admin/super-admin
exports.createAdminAndEnv = async (req, res, next) => {
    try {
        const { adminInfo, valueString, DB_String } = req.body;
        const { username, email, phone, password, confirmPassword } = adminInfo;

        const envValues = valueString + "\n" + `JWT_SECRET=${crypto.randomBytes(12).toString('hex') + Date.now()}` + "\n" + `JWT_EXPIRE_IN="24h"` + "\n" + `JWT_EXPIRE_IN_REMEMBER_ME="168h"`

        if (adminInfo?.password !== adminInfo?.confirmPassword) {
            return res.status(400).json({
                message: "Password invalid",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const ID = crypto.randomBytes(3).toString('hex')

        const u = `${DB_String.split('=')[0]}`
        const r = `${DB_String.split(`${u}=`)[1]}`

        // Database connection
        const db = `${r}`;
        await mongoose.connect(db);

        const newUser = await User.create({
            username,
            email,
            phone,
            role: 'admin',
            password: hashedPassword,
            confirmPassword,
            terms_conditions: true,
            ID,
            userStatus: 'active',
        });

        await User.updateOne(
            { _id: newUser._id },
            { $unset: { confirmPassword: "" } }
        );

        await fs.writeFile(path.join(__dirname, '../.env'), envValues);

        return res.status(200).json({
            status: true,
            env: true
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
}
