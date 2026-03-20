const StudentFormField = require('../models/student_form_field');
const User_form_controller = require('../models/userFormController');
const mongoose = require('mongoose');
const crypto = require('crypto');


// create StudentFormField Code
exports.createStudentFormFiled = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const { id, role } = res.locals.user;

    if (role === 'admin' || role === 'accountant') {

        try {
            let {
                input_name,
                input_type,
                placeholder,
                field_required,
                status,
                step_name,
                userRoleID,
                action_for,
                select_options,
                link,
                user_role
            } = req.body;

            const field_name = input_name;
            input_name = input_name.trim().split(' ').join('_');

            const insertData = {
                field_name,
                input_name,
                input_type,
                placeholder,
                field_required,
                status,
                step_name,
                select_options,
                link,
                user_role: user_role ? user_role.trim().toLowerCase() : 'all'
            };

            if (action_for === 'all') {

                const newStudentFormField = await StudentFormField.create([insertData], { session });

                if (!newStudentFormField) {
                    return res.status(400).json({ message: 'Wrong input! try again..', status: false });
                }

                if (step_name === 'step_one') {
                    await User_form_controller.updateMany(
                        {},
                        { $push: { step_one: newStudentFormField[0] } },
                        { session }
                    );

                } else if (step_name === 'step_two') {
                    await User_form_controller.updateMany(
                        {},
                        { $push: { step_two: newStudentFormField[0] } },
                        { session }
                    );
                }

            } else if (action_for === 'only') {
                const randNumber = crypto.randomBytes(12).toString("hex");
                insertData._id = mongoose.Types.ObjectId(randNumber);

                if (step_name === 'step_one') {
                    await User_form_controller.updateOne(
                        { user_name: mongoose.Types.ObjectId(userRoleID?.id) },
                        { $push: { step_one: insertData } },
                        { session }
                    );

                } else if (step_name === 'step_two') {
                    await User_form_controller.updateOne(
                        { user_name: mongoose.Types.ObjectId(userRoleID?.id) },
                        { $push: { step_two: insertData } },
                        { session }
                    );
                }

            }

            await session.commitTransaction();

            return res.status(200).json({
                status: true,
                message: "New field has been created successfully",
            });

        } catch (error) {
            await session.abortTransaction();
            return res.status(500).json({
                status: false,
                message: error.message
            });

        } finally {
            await session.endSession();
        }

    } else {
        return res.status(403).json({
            status: false,
            message: 'Permission denied!'
        });
    }
};


// get StudentFormField Code
exports.getOneStudentFormField = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;

    if (role === 'admin' || role === 'accountant') {
        try {
            const studentFormField = await StudentFormField.findOne({ _id: mongoose.Types.ObjectId(id) });

            if (!studentFormField) {
                return res.status(404).json({ message: 'Filed Not found', status: false });
            }

            return res.status(200).json({
                status: true,
                data: studentFormField
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message
            });
        }
    } else {
        return res.status(500).json({
            status: false,
            message: 'Server side error!'
        });
    }
};


// get all StudentFormField
exports.getAllStudentFormField = async (req, res, next) => {
    const { query } = req;

    try {
        const studentFormFields = await StudentFormField.paginate(
            {},
            {
                page: query.page || 1,
                limit: query.size || 10,
                sort: { createdAt: -1 },
            }
        );

        if (studentFormFields.docs.length === 0) {
            return res.status(404).json({ message: 'Field not found', status: false });
        }

        return res.status(200).json({
            status: true,
            error: false,
            data: studentFormFields
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};


// delete TaxFileField
exports.deleteStudentFormFiled = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const { id } = req.query;
    const { role } = res.locals.user;

    if (role === 'admin' || role === 'super_admin') {

        try {
            const studentFormField = await StudentFormField.findByIdAndDelete(id, { session });

            if (!studentFormField) {
                return res.status(404).json({ message: 'Field Not found', status: false });
            }

            if (studentFormField?.step_name === 'step_one') {
                await User_form_controller.updateMany(
                    { step_one: { $elemMatch: { _id: studentFormField?._id } } },
                    { $pull: { step_one: { _id: studentFormField?._id, input_name: studentFormField?.input_name } } },
                    { session }
                );

            } else if (studentFormField?.step_name === 'step_two') {
                await User_form_controller.updateMany(
                    { step_two: { $elemMatch: { _id: studentFormField?._id } } },
                    { $pull: { step_two: { _id: studentFormField?._id, input_name: studentFormField?.input_name } } },
                    { session }
                );
            }

            await session.commitTransaction();

            return res.status(200).json({
                status: true,
                message: "Delete successful!"
            });

        } catch (error) {
            await session.abortTransaction();
            return res.status(500).json({
                status: false,
                message: error.message
            });

        } finally {
            await session.endSession();
        }

    } else {
        return res.status(400).json({
            status: false,
            message: "You're not permitted!"
        });
    }
};


// update StudentFormField
exports.updateStudentFormFiled = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;

    if (role === 'admin') {

        try {
            const updateData = { ...req.body };

            if (updateData.user_role) {
                updateData.user_role = updateData.user_role.trim().toLowerCase();
            }

            const studentFormField = await StudentFormField.findByIdAndUpdate(
                id,
                { $set: updateData },
                { validateBeforeSave: false }
            );

            if (!studentFormField) {
                return res.status(400).json({ message: 'Wrong input! try again..', status: false });
            }

            return res.status(200).json({
                status: true,
                message: "Updated successfully!",
                data: studentFormField
            });

        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message
            });
        }

    } else {
        return res.status(403).json({
            status: false,
            message: 'Permission denied!'
        });
    }
};


// get all filtered StudentFormField
exports.getAllFielteredStudentFormField = async (req, res, next) => {
    const { user_role } = req.query;

    try {
        let filter = {};

        if (user_role && user_role.trim() !== '') {
            filter = {
                $or: [
                    { user_role: 'all' },
                    { user_role: user_role.trim().toLowerCase() }
                ]
            };
        }

        const studentFormFields = await StudentFormField.find(filter)
            .sort({ createdAt: 1 })
            .select('field_name input_name input_type placeholder field_required status step_name select_options link user_role');

        if (studentFormFields.length === 0) {
            return res.status(404).json({ message: 'Field not found', status: false });
        }

        return res.status(200).json({
            status: true,
            total: studentFormFields.length,
            data: studentFormFields
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};
