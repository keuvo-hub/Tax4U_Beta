const Site_setting = require('../models/site_setting');
const mongoose = require('mongoose');


// create Site_setting 
exports.createSite_setting = async (req, res, next) => {
    if (res.locals.user.role === 'admin' || res.locals.user.role === 'super_admin') {
        try {

            const newSite_setting = await Site_setting.create(req.body);

            if (!newSite_setting) return res.status(400).json({message: 'Wrong input! try again..', status: false});

            return res.status(200).json({
                status: true,
                message: "New site setting has been created successfully",
                data: newSite_setting
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


// get Site_setting
exports.getOneSite_setting = async (req, res, next) => {

    try {
        const getSite_setting = await Site_setting.findOne({}).populate('admin', '_id username phone email ID')

        if (!getSite_setting) return res.status(404).json({message: 'Site_setting Not found', status: false, data: {theme: 'classic'}});

        return res.status(200).json({
            status: true,
            data: getSite_setting
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// get all Site_setting
exports.getAllSite_setting = async (req, res, next) => {
    const {query} = req;
    const {body} = req;

    try {
        const getAllSite_setting = await Site_setting.find({}).sort("-createdAt")

        if (getAllSite_setting?.length === 0) return res.status(404).json({
            message: 'Site_settings not found',
            status: false
        });

        return res.status(200).json({
            status: true,
            data: getAllSite_setting
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// delete Site_setting
exports.deleteSite_setting = async (req, res, next) => {
    const {id} = req.query;
    const {role} = res.locals.user;

    if (role === 'admin') {

        try {
            const delSite_setting = await Site_setting.findByIdAndDelete(id);

            if (!delSite_setting) return res.status(404).json({message: 'Site_setting Not found', status: false});

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
        return res.status(403).json({
            status: false,
            message: 'Permission denied!'
        })
    }
}


// update Site_setting
exports.updateSite_setting = async (req, res, next) => {
    const {role} = res.locals.user;
    const {id} = req.query;

    if (role === 'admin' || role === 'super_admin') {

        try {
            const updateSite_setting = await Site_setting.findByIdAndUpdate(id, {$set: req.body}, {validateBeforeSave: false})

            if (!updateSite_setting) return res.status(400).json({message: 'Wrong input! try again..', status: false});

            return res.status(200).json({
                status: true,
                message: "Updated successfully!",
                data: updateSite_setting
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


// update
exports.update = async (req, res, next) => {
    try {
        const {body} = req;
        const {role} = res.locals.user;
        if (role === 'admin') {
            await Site_setting.findByIdAndUpdate(body._id, {$set: req.body})
            return res.status(200).json({
                status: true,
                message: "Updated successfully!"
            })
        } else {
            return res.status(403).json({
                status: false,
                message: 'Permission denied'
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Server side error'
        })
    }
}



