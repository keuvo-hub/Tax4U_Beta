const User_form_controller = require('../models/userFormController');
const mongoose = require('mongoose');


// create User_form_controller 
exports.createUser_form_controller = async (req, res, next) => {
    const { role } = res.locals.user;
    if (role === 'admin' || role === 'super_admin') {
        try {
            const newUser_form_controller = await User_form_controller.create(req.body);

            if (!newUser_form_controller) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            return res.status(200).json({
                status: true,
                message: "New user-role created successfully",
                data: newUser_form_controller
            })
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message
            })
        }
    } else {
        return res.status(500).json({
            status: false,
            message: "You're not permitted to do this action."
        })
    }

}


// get User_form_controller by user_name
exports.getOneUser_form_controller = async (req, res, next) => {
    const { id } = req.query;
    try {
        const getUser_form_controller = await User_form_controller.findOne({ user_name: mongoose.Types.ObjectId(id) }).populate('user_name')
        if (!getUser_form_controller) return res.status(404).json({ message: 'User_form_controller Not found', status: false });
        res.status(200).json({
            status: true,
            error: false,
            data: getUser_form_controller
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// get all User_form_controller
exports.getAllUser_form_controller = async (req, res, next) => {
    const { query } = req;
    const { body } = req;
    try {
        const getAllUser_form_controller = await User_form_controller.paginate({
            $or: [
                { user_name: { $regex: new RegExp(query.searchValue, "i") } },
            ]
        }, {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: 1 },
        })

        if (getAllUser_form_controller?.docs?.length == 0) return res.status(404).json({ message: 'User_form_controllers not found', status: false });

        res.status(200).json({
            status: true,
            error: false,
            data: getAllUser_form_controller
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// delete User_form_controller
exports.deleteUser_form_controller = async (req, res, next) => {
    const { id, step_name, user_name } = req.query;
    const { role } = res.locals.user;
    if (role === 'admin' || role === 'super_admin') {
        try {
            let delUser_form_controller;
            if (step_name === 'step_one') {
                delUser_form_controller = await User_form_controller.updateMany(
                    { user_name: mongoose.Types.ObjectId(user_name) },
                    { $pull: { step_one: { _id: mongoose.Types.ObjectId(id) } } },
                );

            } else if (step_name === 'step_two') {
                delUser_form_controller = await User_form_controller.updateMany(
                    { user_name: mongoose.Types.ObjectId(user_name) },
                    { $pull: { step_two: { _id: mongoose.Types.ObjectId(id) } } },
                );
            }

            if (!delUser_form_controller) return res.status(404).json({ message: 'User Role Not found', status: false });


            return res.status(200).json({
                status: true,
                message: "Delete successful!"
            })

        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message
            })
        }
    } else {
        return res.status(400).json({
            status: false,
            message: 'You are not permitted for this action!'
        })
    }
}


// update User_form_controller
exports.updateUser_form_controller = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;
    const { step, status } = req.body;

    if (role === 'admin' || role === 'super_admin') {

        try {
            let updateFormController;

            if (step === 'step_one') {
                updateFormController = await User_form_controller.updateOne(
                    { step_one: { $elemMatch: { _id: mongoose.Types.ObjectId(id) } } },
                    { $set: { "step_one.$.status": status } },
                    { validateBeforeSave: false }
                )

            } else if (step === 'step_two') {
                updateFormController = await User_form_controller.updateOne(
                    { step_two: { $elemMatch: { _id: mongoose.Types.ObjectId(id) } } },
                    { $set: { "step_two.$.status": status } },
                    { validateBeforeSave: false }
                )

            }

            if (!updateFormController) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            return res.status(200).json({
                status: true,
                message: "Updated successfully!",
                data: updateFormController
            })

        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message
            })
        }

    } else {
        return res.status(403).json({
            status: false,
            message: 'Permission denied!'
        })
    }
}


// get all User Role except admin
exports.getAllUser_form_controllerExceptAdmin = async (req, res, next) => {
    const { query } = req;
    const { body } = req;

    try {
        const getAllUser_form_controller = await User_form_controller.paginate({
            $or: [
                { name: { $regex: new RegExp(query.searchValue, "i") } },
                { display_name: { $regex: new RegExp(query.searchValue, "i") } },
            ]
        }, {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: 1 },
        })

        if (getAllUser_form_controller?.docs?.length == 0) return res.status(404).json({ message: 'User_form_controllers not found', status: false });

        const getRoles = getAllUser_form_controller?.docs?.filter(dt => dt?.name !== 'admin');

        return res.status(200).json({
            status: true,
            error: false,
            data: getRoles
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// get specific user-role information
exports.getSpecificUserRoleFormData = async (req, res, next) => {
    const { query } = req;
    const { user_name } = req.query;

    try {

        const formFields = await User_form_controller.aggregate([
            {
                $match: { user_name: mongoose.Types.ObjectId(user_name) },
            },
            {
                $lookup: {
                    from: "userroles",
                    localField: "user_name",
                    foreignField: "_id",
                    as: "user_name"
                }
            },
            {
                $unwind: '$user_name'
            }
        ])

        return res.status(200).json({
            status: true,
            error: false,
            data: formFields[0]
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
}