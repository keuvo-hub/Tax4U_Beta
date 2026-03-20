const mongoose = require('mongoose');
const CouponCode = require('../models/coupon_code');

// create Coupon Code
exports.createCouponCode = async (req, res, next) => {
    const { id, role } = res.locals.user;
    try {
        if (role === 'admin') {
            const { status, type, value, name, coupon_description, coupon_minimum_amount, start_duration, end_duration } = req.body;
            const newCoupon = await CouponCode.create({ status, type, value, name, coupon_description, coupon_minimum_amount, start_duration, end_duration });
            if (!newCoupon) return res.status(400).json({ message: 'Wrong input! try again..', status: false });
            return res.status(200).json({
                status: true,
                message: "Coupon Code created successfully",
                data: newCoupon
            })
        } else {
            return res.status(403).json({
                status: false,
                message: 'Permission denied!'
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error?.message,
        })
    }
}

// get Coupon Code
exports.getOneCouponCode = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;
    if (role === 'admin' || role === 'accountant') {
        const coupon = await CouponCode.findOne({ _id: mongoose.Types.ObjectId(id) })
        if (!coupon) return res.status(400).json({ message: 'Coupon Not found', status: false });
        return res.status(200).json({
            status: true,
            data: coupon
        })
    } else {
        return res.status(500).json({
            status: false,
            message: 'Server side error!'
        })
    }
};


// get all Coupon Code
exports.getAllCouponCode = async (req, res, next) => {
    const { id, role } = res.locals.user;
    const { query } = req;
    const coupons = await CouponCode.paginate({}, {
        page: query.page || 1,
        limit: query.size || 20,
        sort: { createdAt: -1 },
    })
    if (coupons?.docs?.length == 0) return res.status(400).json({ message: 'Coupons Not found', status: false });
    return res.status(200).json({
        status: true,
        error: false,
        data: coupons
    })
};


// delete coupon code
exports.deleteCouponCode = async (req, res, next) => {
    const { id } = req.query;
    const { role } = res.locals.user;
    if (role === 'admin') {
        const coupon = await CouponCode.findByIdAndDelete(id);
        if (!coupon) return res.status(400).json({ message: 'Coupon Not found', status: false });
        return res.status(200).json({
            status: true,
            message: "Delete successful!"
        })
    } else {
        return res.status(500).json({
            status: false,
            message: 'Server side error!'
        })
    }
}


// update coupon code
exports.updateCouponCode = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;
    if (role === 'admin') {
        const coupon = await CouponCode.findByIdAndUpdate(id, { $set: req.body }, { validateBeforeSave: false })
        if (!coupon) return res.status(400).json({ message: 'Wrong input! try again..', status: false });
        return res.status(200).json({
            status: true,
            message: "Coupon infomation updated successfully!",
            data: coupon
        })
    } else {
        return res.status(403).json({
            status: false,
            message: 'Permission denied!'
        })
    }
}