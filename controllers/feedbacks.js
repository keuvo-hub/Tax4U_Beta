const Feedback = require('../models/feedback');
const mongoose = require('mongoose');

// create Feedback 
exports.createFeedback = async (req, res, next) => {
    try {
        const { id } = res.locals.user;
        const isExit = await Feedback.findOne({user: mongoose.Types.ObjectId(id)});
        if(!!isExit) return res.status(200).json({exist: true ,message: "Your have already given a feedback. Thanks"})
        const { ratting, comment } = req.body;
        const newFeedback = await Feedback.create({ user: id, ratting, comment });
        if (!newFeedback) return res.status(400).json({ message: 'Wrong input! try again..', status: false });
        res.status(200).json({
            status: true,
            message: "Thanks for your valuable opinion!",
            data: newFeedback
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

// get Feedback
exports.getOneFeedback = async (req, res, next) => {
    try {
        const { id } = req.query;
        const getFeedback = await Feedback.findOne({ _id: mongoose.Types.ObjectId(id) })
        if (!getFeedback) return res.status(404).json({ message: 'Feedback Not found', status: false });
        res.status(200).json({
            status: true,
            data: getFeedback
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
};

// get user Feedback
exports.getUserFeedback = async (req, res, next) => {
    try {
        const { user } = res.locals;
        const getFeedback = await Feedback.findOne({ user: new mongoose.Types.ObjectId(user.id) })
        if (!getFeedback) return res.status(404).json({ msg: 'Feedback Not found', error: true });
        return res.status(200).json({
            error: false,
            data: getFeedback
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
};


// get all Feedback
exports.getAllFeedback = async (req, res, next) => {
    const { query } = req;
    const { body } = req;
    try {
        const getAllFeedback = await Feedback.paginate({
            $or: [
                { ratting: {$in: Number(query.ratting) || [1,2,3,4,5]}  },
            ]
        }, {
            page: query.page || 1,
            limit: query.size || 20,
            sort: { createdAt: -1 },
            populate: [
                {path: 'user', select: '-password -__v'}
            ]
        })
        if (getAllFeedback?.docs?.length == 0) return res.status(404).json({ message: 'Feedback not found', status: false,  error: false, });
        res.status(200).json({
            status: true,
            error: false,
            data: getAllFeedback
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// delete Feedback
exports.deleteFeedback = async (req, res, next) => {
    const { id } = req.query;
    const { role } = res.locals.user;
    if (role === 'admin') {
        try {
            const delFeedback = await Feedback.findByIdAndDelete(id);
            if (!delFeedback) return res.status(404).json({ message: 'Feedback Not found', status: false });
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


// update Feedback
exports.updateFeedback = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;
    try {
        const updateFeedback = await Feedback.findByIdAndUpdate(id, { $set: req.body }, { validateBeforeSave: false })
        if (!updateFeedback) return res.status(400).json({ message: 'Wrong input! try again..', status: false });
        res.status(200).json({
            status: true,
            message: "Updated successfully!",
            data: updateFeedback
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}


