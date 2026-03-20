const UserRole = require('../models/user_role');
const StudentFormField = require('../models/student_form_field');
const User_form_controller = require('../models/userFormController');
const mongoose = require('mongoose');

// create UserRole 
exports.createUserRole = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const { role } = res.locals.user;
    if (role === 'admin' || role === 'super_admin') {
        try {
            const newUserRole = await UserRole.create([req.body], { session });
            if (!newUserRole) return res.status(400).json({ message: 'Wrong input! try again..', status: false });
            const allFieldOne = await StudentFormField.find({ step_name: 'step_one' });
            const allFieldTwo = await StudentFormField.find({ step_name: 'step_two' });
            await User_form_controller.updateOne(
                { user_name: newUserRole[0]?._id?.toString() },
                { $set: { step_one: allFieldOne, step_two: allFieldTwo } },
                { upsert: true, session }
            );
            await session.commitTransaction();
            return res.status(200).json({
                status: true,
                message: "New user-role created successfully",
                data: newUserRole
            })
        } catch (error) {
            await session.abortTransaction();
            return res.status(500).json({
                status: false,
                message: error.message
            })
        } finally {
            await session.endSession();
        }
    } else {
        return res.status(500).json({
            status: false,
            message: "You're not permitted to do this action."
        })
    }

}

// get UserRole
exports.getOneUserRole = async (req, res, next) => {
    const { id } = req.query;
    try {
        const getUserRole = await UserRole.findOne({ _id: mongoose.Types.ObjectId(id) }).populate('coupon_code')
        if (!getUserRole) return res.status(404).json({ message: 'UserRole Not found', status: false });
        return res.status(200).json({
            status: true,
            data: getUserRole
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// get all UserRole
exports.getAllUserRole = async (req, res, next) => {
    const { query } = req;
    const { body } = req;
    try {
        const getAllUserRole = await UserRole.paginate({
            $or: [
                { name: { $regex: new RegExp(query.searchValue, "i") } },
            ]
        }, {
            page: query.page || 1,
            limit: query.size || 1000,
            sort: { createdAt: 1 },
        })
        if (getAllUserRole?.docs?.length == 0) return res.status(404).json({ message: 'User-Role not found', status: false });
        res.status(200).json({
            status: true,
            error: false,
            data: getAllUserRole
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// delete UserRole
exports.deleteUserRole = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const { id } = req.query;
    const { role } = res.locals.user;
    if (role === 'admin' || role === 'super_admin') {
        try {
            const info = await UserRole.findById(id);
            const delUserRole = await UserRole.findByIdAndDelete(id, { session });

            if (!delUserRole) return res.status(404).json({ message: 'User Role Not found', status: false });

            await User_form_controller.deleteOne({ user_name: info?._id?.toString() }, { session });

            await session.commitTransaction();

            return res.status(200).json({
                status: true,
                message: "Delete successful!"
            })

        } catch (error) {
            await session.abortTransaction();
            return res.status(500).json({
                status: false,
                message: error.message
            })

        } finally {
            await session.endSession();
        }
    } else {
        res.status(500).json({
            status: false,
            message: 'Server side error!'
        })
    }
}


// update UserRole
exports.updateUserRole = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;

    if (role === 'admin' || role === 'super_admin') {

        try {
            const updateUserRole = await UserRole.findByIdAndUpdate(id, { $set: req.body }, { validateBeforeSave: false })

            if (!updateUserRole) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            res.status(200).json({
                status: true,
                message: "Updated successfully!",
                data: updateUserRole
            })

        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            })
        }

    } else {
        res.status(403).json({
            status: false,
            message: 'Permission denied!'
        })
    }
}


// get all User Role except admin
exports.getAllUserRoleExceptAdmin = async (req, res, next) => {
    const { query } = req;
    const { body } = req;

    try {
        const getAllUserRole = await UserRole.paginate({
            $or: [
                { name: { $regex: new RegExp(query.searchValue, "i") } },
                { display_name: { $regex: new RegExp(query.searchValue, "i") } },
            ]
        }, {
            page: query.page || 1,
            limit: query.size || 1000,
            sort: { createdAt: 1 },
            populate: [
                { path: 'coupon_code' },
            ],
        })

        if (getAllUserRole?.docs?.length == 0) return res.status(404).json({ message: 'UserRoles not found', status: false });

        const getRoles = getAllUserRole?.docs?.filter(dt => dt?.name !== 'admin');

        res.status(200).json({
            status: true,
            error: false,
            data: getRoles
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// get User Role data by name/role
exports.getOneUserRoleByRoleName = async (req, res, next) => {
    const { role } = req.query;
    try {
        const getUserRole = await UserRole.findOne({ name: role })
        if (!getUserRole) return res.status(404).json({ message: 'User Role Not found', status: false });
        res.status(200).json({
            status: true,
            data: getUserRole
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// update/set coupon into the user-role
exports.setCouponUserRole = async (req, res, next) => {
    const { userRoleID } = req.query;
    const { couponID } = req.body;
    try {
        const isCouponHas = await UserRole.findOne({ _id: mongoose.Types.ObjectId(userRoleID) }).populate('coupon_code');

        if (isCouponHas?.coupon_code?._id) {
            await UserRole.updateOne(
                { _id: mongoose.Types.ObjectId(userRoleID) },
                { $unset: { coupon_code: couponID } }
            );

            return res.status(200).json({
                status: true,
                update: 'deleted',
                message: 'This coupon has been removed'
            })

        } else {
            const couponIntoUserRole = await UserRole.updateOne(
                { _id: mongoose.Types.ObjectId(userRoleID) },
                { $set: { coupon_code: couponID } }
            );

            if (couponIntoUserRole?.modifiedCount === 0) {
                return res.status(200).json({
                    status: false,
                    message: 'Failed to assign!'
                })
            }

            return res.status(200).json({
                status: true,
                update: 'updated',
                message: 'This coupon has been assigned'
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
}