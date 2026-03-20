const Permission = require('../models/permission');
const mongoose = require('mongoose');
const User = require('../models/user');


// create Permission 
exports.createPermission = async (req, res, next) => {
    const { id, role } = res.locals.user;

    if (role === 'admin') {

        try {
            const { admin, student, accountant } = req.body;

            const newPermission = await Permission.create({ admin, student, accountant });

            if (!newPermission) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            res.status(200).json({
                status: true,
                message: "Permission has been created successfully",
                data: newPermission
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


// get Permission
exports.getOnePermission = async (req, res, next) => {
    const { id } = req.query;

    try {
        const getPermission = await Permission.findOne({ _id: mongoose.Types.ObjectId(id) })

        if (!getPermission) return res.status(404).json({ message: 'Permission Not found', status: false });

        res.status(200).json({
            status: true,
            data: getPermission
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }

};


// get all Permission
exports.getAllPermission = async (req, res, next) => {

    try {
        const getAllPermission = await Permission.find({})

        if (getAllPermission.length == 0) return res.status(404).json({ message: 'Permission data not found', status: false });

        res.status(200).json({
            status: true,
            total: getAllPermission.length,
            data: getAllPermission
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// delete Permission
exports.deletePermission = async (req, res, next) => {
    const { id } = req.query;
    const { role } = res.locals.user;

    if (role === 'admin') {

        try {
            const delPermission = await Permission.findByIdAndDelete(id);

            if (!delPermission) return res.status(404).json({ message: 'Data Not found', status: false });

            res.status(200).json({
                status: true,
                message: "Delete successful!"
            })

        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            })
        }


    } else {
        res.status(500).json({
            status: false,
            message: 'Server side error!'
        })
    }
}


// update permission
exports.updatePermission = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;

    if (role === 'admin') {

        try {
            const updatePermission = await Permission.findByIdAndUpdate(id, { $set: req.body }, { validateBeforeSave: false })

            if (!updatePermission) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            res.status(200).json({
                status: true,
                message: "Updated successfully!",
                data: updatePermission
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


