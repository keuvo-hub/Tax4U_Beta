const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mongoose = require('mongoose');
const User = require("../models/user");
const fs = require('fs');
const express = require('express');
const mailConfig = require("../utils/email");
const emitter = require('../utils/service');
const mailConfig4 = require("../utils/multiUserSender");
const mailConfig5 = require("../utils/EmailToAdmins");
const Env_variables = require('../models/env_variable');
const app = express();


// database calling and set env data
let accountSid, authToken, client;

const envData = async () => {
    const envFileData = await Env_variables.findOne({});

    accountSid = envFileData?.twilio_account_sid;
    authToken = envFileData?.twilio_auth_token;
}

envData()

// token generate
const signToken = async (id, remember_me) => {
    if (remember_me == true) {
        return jwt.sign({id}, process.env.JWT_SECRET, {
            expiresIn: `${process.env.JWT_EXPIRE_IN_REMEMBER_ME}`,
        });
    } else {
        return jwt.sign({id}, process.env.JWT_SECRET, {
            expiresIn: `${process.env.JWT_EXPIRE_IN}`,
        });
    }
};

// new user create
exports.signup = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {
            username,
            email,
            phone,
            role,
            password,
            confirmPassword,
            terms_conditions,
            remember_me,
        } = req.body;

        const userEmail = await User.findOne({email});
        if (!!userEmail)
            return res.status(406).json({message: "User already exist!"});

        if (terms_conditions !== true) return res.status(400).json({
            status: false,
            message: "terms and conditions needed!"
        });

        const envFileData = await Env_variables.findOne({});

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Password invalid",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // const ID = crypto.randomUUID().split("-")[0];
        const ID = crypto.randomBytes(3).toString('hex')

        const newUser = await User.create(
            [
                {
                    username,
                    email,
                    phone,
                    role,
                    password: hashedPassword,
                    confirmPassword,
                    terms_conditions,
                    ID,
                }
            ], {session}
        );

        await User.updateOne(
            {_id: newUser[0]?._id},
            {$unset: {confirmPassword: ""}}, {session}
        );

        const verifyToken = await jwt.sign(
            {id: newUser[0]?._id},
            process.env.JWT_SECRET,
            {expiresIn: "24h"}
        );

        const verifyLink = `${req.protocol}://${req.get('host')}/api/user/verify-account?token=${verifyToken}&&userStatus=active`;

        await mailConfig4(newUser[0], verifyLink);
        emitter.emit("admin_notification", {newUser})

        await session.commitTransaction();
        return res.status(201).json({
            message: "User created successfully",
            status: true,
        });
    } catch (error) {
        await session.abortTransaction();
        if (error.code == 11000) {
            return res.status(406).json({
                message: "Email already exist!",
            });
        } else {
            return res.status(500).json({
                err: error.message,
                message: "Server side error!",
            });
        }
    } finally {
        await session.endSession();
    }
};

// delete user
exports.deleteUser = async (req, res, next) => {
    const {role} = res.locals.user;
    if (role === "admin") {
        const {userId} = req.query;
        try {
            const taxFilePrice = await User.findByIdAndDelete(userId);
            if (!taxFilePrice)
                return res
                    .status(400)
                    .json({message: "User not found!", status: false});

            return res.status(200).json({
                status: true,
                message: "User deleted successfully!",
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message,
            });
        }
    } else {
        return res.status(403).json({
            status: false,
            message: "Permission denied!",
        });
    }
};

// delete user
exports.delUser = async (req, res, next) => {
    try {
        const {query} = req;
        const taxFilePrice = await User.findByIdAndDelete(query?._id);
        if (!taxFilePrice)
            return res
                .status(404)
                .json({msg: "User not found!", error: true});

        return res.status(200).json({
            error: false,
            msg: "User deleted successfully!",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message,
        });
    }
}

// login & send one time OTP Code
exports.login = async (req, res, next) => {
    try {
        let {username, password, remember_me} = req.body;
        if (remember_me !== true) remember_me = false;

        const user = await User.findOne({
            $or: [{email: req.body.username}, {phone: req.body.username}],
        });

        if (!user)
            return res
                .status(404)
                .json({message: "User not found!", status: false});


        const envFileData = await Env_variables.findOne({});

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            // otp generate, time set
            const otp = Math.floor(100000 + Math.random() * 900000);
            const time_set = 10 * 60 * 1000; // ten min.
            const expireDate = Date.now() + time_set;

            // hash otp
            const salt = await bcrypt.genSalt(10);
            const hashedOTP = await bcrypt.hash(otp + "", salt);
            const hashOtpExpire = `${hashedOTP} ${expireDate}`;

            // update otp
            await User.findByIdAndUpdate(user._id, {
                $set: {otp: hashOtpExpire},
            });

            if (envFileData?.twilio_status === 'enable') {
                // send msg
                client = require("twilio")(accountSid, authToken);
                client.messages
                    .create({
                        body: `Taxants OTP = ${otp} valid for 10 minutes.`,
                        from: envFileData?.twilio_number,
                        to: user.phone,
                    })
                    .then((messages) => {
                        if (!!messages) {
                            return res.status(200).json({
                                message: "OTP has sent, Check your phone.",
                                status: true,
                                userStatus: user?.userStatus,
                                username,
                                otp
                            });
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        return res.status(200).json({
                            message: "Something wrong! try again...",
                            status: false,
                        });
                    });

            } else if (envFileData?.twilio_status === 'disable') {
                // only for development purpose or less security
                return res.status(200).json({
                    message: "OTP has sent, Check your phone.",
                    status: true,
                    userStatus: user?.userStatus,
                    username,
                    otp
                });
            }

        } else {
            return res.status(400).json({
                status: false,
                message: "Invalid input!",
            });
        }

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// verify one time OTP Code
exports.verifyOTP = async (req, res, next) => {
    try {
        const {otp} = req.body;

        const user = await User.findOne({
            $or: [{email: req.body.username}, {phone: req.body.username}],
        });

        if (!user)
            return res
                .status(404)
                .json({message: "User not found", status: false});

        const [userHashedOtp, expireTime] = user.otp.split(" ");

        const otpMatched = await bcrypt.compare(otp, userHashedOtp);

        if (otpMatched === false)
            return res.status(400).json({
                status: false,
                message: "Wrong OTP! try again...",
            });

        // checking valid time & delete otp from db(optional)
        if (parseInt(expireTime) >= parseInt(Date.now())) {
            const token = await signToken(user._id);
            return res
                .status(200)
                .json({message: "Login successful", status: true, token});
        } else {
            res.status(400).json({
                status: false,
                message: "Timeout! try again...",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


// user password chance
exports.passwordChange = async (req, res, next) => {
    try {
        const {id} = res.locals.user;
        const {currentPassword, password, confirmPassword} = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({
                status: false,
                message: 'Password invalid!'
            })
        }

        const userInfo = await User.findById(id);
        const isMatched = await bcrypt.compare(currentPassword, userInfo.password);

        if (isMatched) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.findByIdAndUpdate(id, {$set: {password: hashedPassword}});
            return res.status(200).json({
                status: true,
                message: 'Password has changed successfully!'
            })
        } else {
            return res.status(403).json({
                status: false,
                message: 'Request rejected!'
            });
        }
    } catch (e) {
        return res.status(500).json({
            status: false,
            error: e.message
        })
    }
}


// user password chance
exports.passwordChangeByAdmin = async (req, res, next) => {
    try {
        const {password, confirmPassword, id} = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({
                status: false,
                message: 'Password invalid!'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(id, {$set: {password: hashedPassword}});
        return res.status(200).json({
            status: true,
            message: 'Password has changed successfully!'
        })

    } catch (e) {
        return res.status(500).json({
            status: false,
            error: e.message
        })
    }
}


// send email to reset password
exports.sendUserPasswordResetEmail = async (req, res, next) => {
    const {email} = req.body;
    if (!email) return res.status(400).json({message: "Please provide valid email."})

    try {
        const user = await User.findOne({email}).select('-password');
        if (!user) return res.status(404).json({message: "Invalid request!", status: false})

        const envFileData = await Env_variables.findOne({});

        // generate link with token and send it to user email
        const secret = process.env.JWT_SECRET;
        const token = await jwt.sign({id: user._id}, secret, {expiresIn: '10m'});

        const originURL = req.headers.origin;
        const link = `${originURL}/passwordReset/?token=${token}`;

        // now send token to email
        const info = await mailConfig(user, link)
        // const info = true

        if (info) {
            return res.status(200).json({status: true, message: "Password Reset Email Sent, Please Check Your Email."});
        } else {
            return res.status(500).json({status: false, message: "Failed, try again!"});
        }

    } catch (e) {
        return res.status(500).json({
            status: false,
            error: e.message
        })
    }
}


// password update after verify, this function little bit different from passwordChange()
// because of currentPassword field
exports.passwordReset = async (req, res, next) => {
    const {id} = res.locals.user;
    const {password, confirmPassword} = req.body;
    try {
        const user = await User.findById(id).select("-password -__v");
        if (!user) return res.status(404).json({message: "Invalid Request, User Not Found!"});

        if (password !== confirmPassword) return res.status(400).json({message: "Invalid Password"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        await User.findByIdAndUpdate(id, {$set: {password: hashedPassword}});

        return res.status(200).json({
            status: true,
            message: 'Password has changed successfully!'
        });

    } catch (e) {
        return res.status(500).json({
            status: false,
            message: e.message
        });
    }
};


// user account active 
exports.varifyAccount = async (req, res, next) => {
    const {token, userStatus} = req.query;
    try {
        const envFileData = await Env_variables.findOne({});

        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded?.id);

        if ((user?.id?.toString().trim()) === decoded?.id) {
            const userUpdate = await User.updateOne({_id: user?.id}, {$set: {userStatus}});

            if (userUpdate?.modifiedCount === 1) {
                return res.redirect(envFileData?.redirect_url)
            } else {
                return res.status(404).json({
                    status: false,
                    message: 'Sorry! User not found'
                })
            }
        } else {
            return res.status(404).json({
                status: false,
                message: 'Sorry! User not found'
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
}


exports.directLogin = async (req, res, next) => {
    try {
        let {username, password, remember_me} = req.body;
        if (remember_me !== true) remember_me = false;

        if (username) {
            const user = await User.findOne({
                $or: [{email: req.body.username}, {phone: req.body.username}],
            })
            if (user) {
                let auth = await bcrypt.compare(password, user.password)
                if (auth) {
                    let token = await signToken(user._id, remember_me);
                    return res.status(200).send({
                        error: false,
                        msg: 'Login successful',
                        userStatus: user?.userStatus,
                        token,
                    })
                } else {
                    return res.status(401).send({
                        error: true,
                        msg: 'Invalid password'
                    })
                }
            }
        }
        return res.status(404).json({
            error: true,
            msg: 'User not found'
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}