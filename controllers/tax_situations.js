const Tax_situation = require('../models/tax_situation');
const mongoose = require('mongoose');


// create Tax_situation 
exports.createTax_situation = async (req, res, next) => {

    if (res.locals.user.role === 'admin' || res.locals.user.role === 'super_admin') {
        try {

            const newTax_situation = await Tax_situation.create(req.body);

            if (!newTax_situation) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            return res.status(200).json({
                status: true,
                message: "created successfully",
                data: newTax_situation
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


// get Tax_situation
exports.getOneTax_situation = async (req, res, next) => {
    const { userRoleID } = req.query;

    try {
        const getTax_situation = await Tax_situation.findOne({ user_role: mongoose.Types.ObjectId(userRoleID) }).populate('user_role');

        if (!getTax_situation) return res.status(404).json({ message: 'Tax_situation Not found', status: false });

        return res.status(200).json({
            status: true,
            data: getTax_situation
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// get all Tax_situation
exports.getAllTax_situation = async (req, res, next) => {

    try {
        const getAllTax_situation = await Tax_situation.find({}).sort("-createdAt")

        if (getAllTax_situation?.length === 0) return res.status(404).json({ message: 'Tax_situations not found', status: false });

        return res.status(200).json({
            status: true,
            data: getAllTax_situation
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// delete Tax_situation
exports.deleteTax_situation = async (req, res, next) => {
    const { id } = req.query;
    const { role } = res.locals.user;

    if (role === 'admin' || role === 'super_admin') {

        try {
            const delTax_situation = await Tax_situation.findByIdAndDelete(id);

            if (!delTax_situation) return res.status(404).json({ message: 'Tax_situation Not found', status: false });

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


// update Tax_situation
exports.updateTax_situation = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;

    if (role === 'admin' || role === 'super_admin') {

        try {
            const updateTax_situation = await Tax_situation.findByIdAndUpdate(id, { $set: req.body }, { validateBeforeSave: false })

            if (!updateTax_situation) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            return res.status(200).json({
                status: true,
                message: "Updated successfully!",
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



// update from array
exports.updateArrayTaxSituation = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;


    if (role === 'admin' || role === 'super_admin') {

        try {
            const updateSite_content_about = await Tax_situation.findByIdAndUpdate(id, { $push: req.body }, { validateBeforeSave: false })

            if (!updateSite_content_about) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            return res.status(200).json({
                status: true,
                message: "Updated successfully!",
                data: updateSite_content_about
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


// delete Tax_situation from array
exports.deleteFromArrayTax_situation = async (req, res, next) => {
    const { id } = req.query;
    const { role } = res.locals.user;

    if (role === 'admin' || role === 'super_admin') {

        try {

            let delTax_situation = await Tax_situation.updateOne(
                { _id: mongoose.Types.ObjectId(id) },
                { $pull: { work_process_description: { _id: req.body._id } } }
            );

            if (!delTax_situation) return res.status(404).json({ message: 'Tax_situation Not found', status: false });

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