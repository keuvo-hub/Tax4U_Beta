const ContactUs = require('../models/contact_us');
const mongoose = require('mongoose');
const mailConfig3 = require('../utils/contactUsEmail');

// create ContactUs 
exports.createContactUs = async (req, res, next) => {
    try {
        const newContactUs = await ContactUs.create(req.body);
        if (!newContactUs) return res.status(400).json({ message: 'Wrong input! try again..', status: false });
        const emailData = {
            name: newContactUs.firstname + " " + newContactUs.lastname,
            phone: newContactUs.phone,
            email: newContactUs.email,
            subject: newContactUs.subject,
            message: newContactUs.message
        }
        await mailConfig3(emailData)
        return res.status(200).json({
            status: true,
            message: "Thanks for your message.",
            data: newContactUs
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something Wrong!"
        })
    }
}

// get ContactUs
exports.getOneContactUs = async (req, res, next) => {
    try {
        const { id } = req.query;
        const getContactUs = await ContactUs.findOne({ _id: mongoose.Types.ObjectId(id) })
        if (!getContactUs) return res.status(404).json({ message: 'ContactUs Not found', status: false });
        return res.status(200).json({
            status: true,
            data: getContactUs
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};

// get all ContactUs
exports.getAllContactUs = async (req, res, next) => {
    const { query } = req;
    try {
        const getAllContactUs = await ContactUs.paginate(
            {
                $or: [
                    { firstname: { $regex: new RegExp(query.searchValue, "i") } },
                    { lastname: { $regex: new RegExp(query.searchValue, "i") } },
                    { email: { $regex: new RegExp(query.searchValue, "i") } },
                    { status: { $regex: new RegExp(query.searchValue, "i") } },
                ]
            },
            {
                page: Number(query.page) || 1,
                limit: query.numberOfRow || query.size || 20,
                sort: { createdAt: -1 },
            }
        )
        if (getAllContactUs?.docs?.length == 0) return res.status(404).json({ message: 'ContactUs not found', status: false, error: false, });
        return res.status(200).json({
            status: true,
            error: false,
            data: getAllContactUs
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};

// delete ContactUs
exports.deleteContactUs = async (req, res, next) => {
    const { id } = req.query;
    const { role } = res.locals.user;
    if (role === 'admin' || role === 'accountant') {
        try {
            const delContactUs = await ContactUs.findByIdAndDelete(id);
            if (!delContactUs) return res.status(404).json({ message: 'ContactUs Not found', status: false });
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
            message: 'You are not authorized!'
        })
    }
}

// update ContactUs
exports.updateContactUs = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;
    try {
        const updateContactUs = await ContactUs.findByIdAndUpdate(id, { $set: req.body }, { validateBeforeSave: false })
        if (!updateContactUs) return res.status(400).json({ message: 'Wrong input! try again..', status: false });
        return res.status(200).json({
            status: true,
            message: "Updated successfully!",
            data: updateContactUs
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
}


