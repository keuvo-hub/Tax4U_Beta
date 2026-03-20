const mongoose = require("mongoose");
const Role = require("../models/role");
const User = require('./../models/user');
const Taxfile = require('./../models/taxfile')
const bcrypt = require('bcrypt');
const mailConfig2 = require('../utils/userEmailSend');
const {numberGen} = require("../utils/common");
const crypto = require('crypto')
const uuid = require("uuid").v4;

// get one user
exports.getOneUser = async (req, res, next) => {
    try {
        const {userId} = req.query;
        const user = await User.findById(userId).select('-password -__v -otp');

        if (!user) return res.status(404).status({status: false, message: 'User not found'});

        return res.status(200).json({
            status: true,
            data: user
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Server side error'
        })
    }
}


// get all user
exports.getAllUser = async (req, res, next) => {
    const {role} = res.locals.user;
    const {query} = req;

    if (role === 'admin' || role === 'accountant') {
        try {
            let users;
            if (query.filterUser) {
                users = await User.paginate({
                    role: query.filterUser,
                }, {
                    page: query.page || 1,
                    limit: req.query.numberOfRow || query.size || 20,
                    sort: {createdAt: -1},
                })

            } else {
                users = await User.paginate({
                    $or: [
                        {username: {$regex: new RegExp(query.searchValue, "i")}},
                        {email: {$regex: new RegExp(query.searchValue, "i")}},
                        {role: {$regex: new RegExp(query.searchValue, "i")}},
                        {phone: {$regex: new RegExp(query.searchValue, "i")}},
                        {country: {$regex: new RegExp(query.searchValue, "i")}},
                        {city: {$regex: new RegExp(query.searchValue, "i")}},
                    ],
                }, {
                    page: query.page || 1,
                    limit: req.query.numberOfRow || query.size || 20,
                    sort: query?.sortData === 'username' && {username: 1} ||
                        query?.sortData === 'email' && {email: 1} ||
                        query?.sortData === 'userStatus' && {userStatus: 1} ||
                        query?.sortData === 'role' && {role: 1} ||
                        query?.sortData === 'city' && {"province_name.name": 1} ||
                        query?.sortData === 'country' && {country: 1} ||
                        query?.sortData === 'steps' && {steps: 1} ||
                        query?.sortData === 'createdAt' && {createdAt: 1} ||
                        query?.sortData === 'updatedAt' && {updatedAt: 1} ||
                        {createdAt: -1}
                })
            }


            if (users.docs?.length === 0) return res.status(404).status({status: false, message: 'User not found'});

            return res.status(200).json({
                status: true,
                error: false,
                data: users
            })

        } catch (error) {
            return res.status(500).json({
                status: false,
                message: 'Server side error'
            })
        }
    } else {
        return res.status(403).json({
            status: false,
            message: 'Permission denied!'
        })
    }
}


// user info update
exports.userInfoUpdate = async (req, res, next) => {
    const {userId} = req.query;
    try {

        const user = await User.findByIdAndUpdate(userId, {$set: req.body}, {validateBeforeSave: false}).select('-otp');

        if (!user) return res.status(404).json({status: false, message: 'User not found!'})


        return res.status(200).json({
            status: true,
            message: "User information updated successfully!",
            data: user
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Server side error'
        })
    }
}


// verify user
exports.varifyUser = async (req, res, next) => {
    const {id} = res.locals.user;
    try {
        const user = await User.findById(id).select('-password -__v -otp').populate('department', 'name').populate('permission', 'name permissions');

        if (!user) return res.status(400).json({status: false, message: "User not found"});

        return res.status(200).json({
            status: true,
            data: user
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// filter user for role management
exports.filterUser = async (req, res, next) => {
    try {
        const roleManagement = await User?.aggregatePaginate(User.aggregate([
            {
                $project: {
                    _id: 1,
                    role: 1,
                    display_name: 1,
                    description: 1,
                }
            },
            {
                $group: {
                    _id: "$role",
                    display_name: {$first: "$display_name"},
                    description: {$first: "$description"},
                    total: {$sum: 1}
                }
            },
            {$sort: {total: 1}}
        ]))

        res.status(200).json({data: roleManagement, error: false, status: true})

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}


// update many user's info
exports.updateManyAction = async (req, res, next) => {
    const {role} = req.query;

    try {
        const users = await User.updateMany({role}, {$set: req.body}, {validateBeforeSave: false});

        if (users?.acknowledged === true) {
            return res.status(200).json({status: true, message: "Role info updated successfully!"})

        } else {
            return res.status(500).json({
                status: false,
                message: "Failed! try again.."
            })
        }


    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}


// get all user
exports.getAllAccountant = async (req, res, next) => {
    const {role} = res.locals.user;
    const {role: accountant} = req.query;
    if (role === 'admin' || role === 'accountant') {
        try {
            const accountants = await User.find({role: accountant}).select('-password -__v -otp').populate('department', 'name').populate('permission', 'name permissions').lean();
            if (accountants.length === 0) return res.status(404).status({
                status: false,
                message: 'Accountant not found'
            });
            return res.status(200).json({
                status: true,
                data: accountants
            })
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: 'Server side error'
            })
        }
    } else {
        return res.status(403).json({
            status: false,
            message: 'Permission denied!'
        })
    }
}


// get total count
exports.getTotalCount = async (req, res, next) => {
    try {
        const totalUsers = await User.find().count();
        const totalTaxFile = await Taxfile.find().count();
        const totalTaxFileComplete = await Taxfile.find({taxfile_status: 'completed'}).count();

        res.status(200).json({
            error: false,
            status: true,
            totalUsers,
            totalTaxFile,
            totalTaxFileComplete
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Server side error'
        })
    }
}


// send email
exports.sendEmailToUser = async (req, res, next) => {
    try {

        const result = await mailConfig2(req.body);

        if (result) {
            return res.status(200).json({status: true, message: "Email has send to the user."});
        } else {
            return res.status(500).json({status: false, message: "Failed, try again!"});
        }

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Server side error'
        })
    }
}

exports.employeeElement = async () => {
    try {
        let employeeRoles = await Role.find({}).select('name');
        let arr = [];
        for (let i = 0; i < employeeRoles.length; i++) {
            if (employeeRoles[i].name === 'user' ||
                employeeRoles[i].name === 'super_admin' ||
                employeeRoles[i].name === 'admin' ||
                employeeRoles[i].name === 'site_admin') {
                continue
            }
            arr.push(employeeRoles[i]);
        }

        return arr;

    } catch (error) {
        return []
    }
}

/**
 * employee
 */
exports.employeeCreate = async (req, res) => {
    try {
        const {user: admin} = res.locals;
        let {body} = req;

        let hashedPassword;
        if (body.password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(body.password, salt);
        }

        if (!!body._id) {
            await User.updateOne({_id: body._id}, {...body, password: hashedPassword});
            return res.status(200).send({
                error: false,
                msg: 'Updated Successful',
            });
        } else {
            const isUser = await User.findOne({
                $or: [
                    {email: body.email},
                    {phone: body.phone},
                ]
            });
            if (!!isUser) {
                return res.status(400).send({
                    error: true,
                    msg: 'An account with this credential has already existed',
                });
            }

            const randomNumberGen = await crypto.randomBytes(4).toString('hex')
            let user = new User({
                username: body.username,
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                phone: body.phone,
                password: hashedPassword,
                role: body.role,
                joining_date: body.joining_date,
                department: body.department,
                permission: body.permission,
                key: randomNumberGen,
                ID: randomNumberGen,
                userStatus: 'active',
                terms_conditions: true,
                //added for ticket system
                ticket_departments: body.ticket_departments,
                ticket_categories: body.ticket_categories,
                ticket_types: body.ticket_types,
            })
            await user.save();
            return res.status(200).send({
                error: false,
                msg: 'Successfully employee created'
            });
        }

    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: true,
            msg: 'Server failed',
            data: "Server failed"
        })
    }
};

exports.employeeList = async (req, res) => {
    try {
        const {query} = req;
        let filter = {};
        if (!!query.search) {
            filter = {
                $or: [
                    {"name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"email": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"phone": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"key": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"department.name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        const employees = await User?.aggregatePaginate(User.aggregate([
            {
                $match: {
                    $or: [
                        {role: 'employee'},
                        {role: 'accountant'}
                    ]
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'department',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            {$unwind: {path: "$department", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'roles',
                    localField: 'permission',
                    foreignField: '_id',
                    as: 'permission'
                }
            },
            {$unwind: {path: "$permission", preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    password: 0
                }
            },
            {$match: filter}
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: -1},
        });

        return res.status(200).json({
            error: false,
            data: employees
        })

    } catch (e) {
        return res.status(200).json({
            error: true,
            data: e.message
        })
    }
}

exports.filteringEmployeeList = async (req, res) => {
    try {
        const {query} = req;
        // @ts-ignore
        const employees = await User?.aggregatePaginate(User.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            {$eq: ['$role', 'employee']},
                            {$eq: ['$department', new mongoose.Types.ObjectId(query.department)]},
                            {$eq: ['$permission', new mongoose.Types.ObjectId(query.role)]},
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'department',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            {$unwind: {path: "$department", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'roles',
                    localField: 'permission',
                    foreignField: '_id',
                    as: 'permission'
                }
            },
            {$unwind: {path: "$permission", preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    ID: 1,
                    createdAt: 1,
                    department: 1,
                    email: 1,
                    firstName: 1,
                    key: 1,
                    lastName: 1,
                    permission: 1,
                    phone: 1,
                    role: 1,
                    steps: 1,
                    terms_conditions: 1,
                    updatedAt: 1,
                    userStatus: 1,
                    username: 1,
                    name: {$concat: ["$firstName", " ", "$lastName"]}
                }
            }
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: -1},
        });

        return res.status(200).json({
            error: false,
            data: employees
        })

    } catch (e) {
        return res.status(200).json({
            error: true,
            data: e.message
        })
    }
}
