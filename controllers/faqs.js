const Faq = require('../models/faq');
const mongoose = require('mongoose');

// create Faq 
exports.createFaq = async (req, res, next) => {
    try {
        const { question, answer } = req.body;
        const newFaq = await Faq.create({ question, answer });
        if (!newFaq) return res.status(400).json({ message: 'Wrong input! try again..', status: false });
        return res.status(200).json({
            status: true,
            message: "New faq has been created successfully",
            data: newFaq
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
}


// get Faq
exports.getOneFaq = async (req, res, next) => {
    const { id } = req.query;
    try {
        const getFaq = await Faq.findOne({ _id: mongoose.Types.ObjectId(id) })
        if (!getFaq) return res.status(404).json({ message: 'Faq Not found', status: false });
        return res.status(200).json({
            status: true,
            data: getFaq
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// get all Faq
exports.getAllFaq = async (req, res, next) => {
    const { query } = req;
    const { body } = req;
    try {
        const getAllFaq = await Faq.paginate({
            $or: [
                { question: { $regex: new RegExp(query.searchValue, "i") } },
            ]
        }, {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        })
        if (getAllFaq?.docs?.length == 0) return res.status(404).json({ message: 'Faqs not found', status: false });
        return res.status(200).json({
            status: true,
            error: false,
            data: getAllFaq
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// delete Faq
exports.deleteFaq = async (req, res, next) => {
    const { id } = req.query;
    const { role } = res.locals.user;
    if (role === 'admin') {
        try {
            const delFaq = await Faq.findByIdAndDelete(id);
            if (!delFaq) return res.status(404).json({ message: 'Faq Not found', status: false });
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
        return res.status(500).json({
            status: false,
            message: 'Server side error!'
        })
    }
}


// update Faq
exports.updateFaq = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;
    if (role === 'admin') {
        try {
            const updateFaq = await Faq.findByIdAndUpdate(id, { $set: req.body }, { validateBeforeSave: false })
            if (!updateFaq) return res.status(400).json({ message: 'Wrong input! try again..', status: false });
            return res.status(200).json({
                status: true,
                message: "Updated successfully!",
                data: updateFaq
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


