const Payment_method = require('../models/payment_method');
const mongoose = require('mongoose');


// create Payment_method 
exports.createPayment_method = async (req, res, next) => {
    const { role } = res.locals.user;
    if (role === 'admin') {
        try {

            const newPayment_method = await Payment_method.create(req.body);

            if (!newPayment_method) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            return res.status(200).json({
                status: true,
                message: "Payment option has been set successfully",
                data: newPayment_method
            })
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message
            })
        }
    }
};


// get Payment_method
exports.getOnePayment_method = async (req, res, next) => {
    const { id } = req.query;

    try {
        const getPayment_method = await Payment_method.find({})

        if (!getPayment_method) return res.status(404).json({ message: 'Payment_method Not found', status: false });

        return res.status(200).json({
            status: true,
            data: getPayment_method
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// update Payment_method
exports.updatePayment_method = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;

    if (role === 'admin') {

        try {
            const updatePayment_method = await Payment_method.findByIdAndUpdate(id, { $set: req.body }, { validateBeforeSave: false })

            if (!updatePayment_method) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            return res.status(200).json({
                status: true,
                message: "Updated successfully!",
                data: updatePayment_method
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
};