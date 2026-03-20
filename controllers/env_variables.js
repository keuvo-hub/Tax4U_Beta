const Env_variables = require('../models/env_variable');
const mongoose = require('mongoose');

// create Env_variables 
exports.createEnv_variables = async (req, res, next) => {
    try {
        const newEnv_variables = await Env_variables.create(req.body);
        if (!newEnv_variables) return res.status(400).json({ message: 'Wrong input! try again..', status: false });
        return res.status(200).json({
            status: true,
            error: false,
            message: "Env_variables has been created successfully",
            data: newEnv_variables
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

// get Env_variables
exports.getOneEnv_variables = async (req, res, next) => {
    try {
        const getEnv_variables = await Env_variables.findOne({});
        if (!getEnv_variables) return res.status(404).json({ message: 'Env_variables Not found', status: false });
        return res.status(200).json({
            status: true,
            error: false,
            data: getEnv_variables
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// delete Env_variables
exports.deleteEnv_variables = async (req, res, next) => {
    const { id } = req.query;
    const { role } = res.locals.user;
    if (role === 'admin' || role === 'super_admin') {
        try {
            const delEnv_variables = await Env_variables.findByIdAndDelete(id);
            if (!delEnv_variables) return res.status(404).json({ message: 'Env_variables Not found', status: false });
            return res.status(200).json({
                status: true,
                error: false,
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
            message: 'Permission restricted'
        })
    }
}


// update Env_variables
exports.updateEnv_variables = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;
    if (role === 'admin' || role === 'super_admin') {
        try {
            const updateEnv_variables = await Env_variables.findByIdAndUpdate(id, { $set: req.body }, { validateBeforeSave: false })
            if (!updateEnv_variables) return res.status(400).json({ message: 'Wrong input! try again..', status: false });
            return res.status(200).json({
                status: true,
                error: false,
                message: "Updated successfully!",
                data: updateEnv_variables
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


// get Env_variables
exports.publiclyAccessible = async (req, res, next) => {
    try {
        const getEnv_variables = await Env_variables.findOne({}).select('website_domain_name admin_email website_name logo_url company_email twak_to_src_url twilio_status');
        if (!getEnv_variables) return res.status(404).json({ message: 'Env_variables Not found', status: false });
        return res.status(200).json({
            status: true,
            error: false,
            data: getEnv_variables
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};
