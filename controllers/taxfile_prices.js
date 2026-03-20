const Taxfile_price = require('../models/taxfile_price');
const mongoose = require('mongoose')


// create tax file price
exports.createTaxFilePrice = async (req, res, next) => {
    const { id, role } = res.locals.user;
    if (role === 'admin' || role === 'super_admin') {
        try {
            const taxFilePrice = await Taxfile_price.create(req.body)

            if (!taxFilePrice) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            return res.status(200).json({
                status: true,
                message: "Tax File Prices created successfully",
                data: taxFilePrice
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


// get tax file price
exports.taxFilePriceGet = async (req, res, next) => {
    try {
        const taxFilePrice = await Taxfile_price.find({})

        if (!taxFilePrice) return res.status(400).json({ message: 'Content Not found', status: false });

        return res.status(200).json({
            status: true,
            data: taxFilePrice[0]
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }

};


// get all tax file price
exports.taxFilePriceGetAll = async (req, res, next) => {
    try {
        const taxFilePriceAll = await Taxfile_price.find({})

        if (!taxFilePriceAll) return res.status(400).json({ message: 'Content Not found', status: false });

        return res.status(200).json({
            status: true,
            data: taxFilePriceAll
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// get tax file price
exports.specificTaxPrice = async (req, res, next) => {
    const { user_role } = req.query;
    try {
        const taxFilePrice = await Taxfile_price.findOne({ user_role })

        if (!taxFilePrice) return res.status(400).json({ message: 'Price Not found', status: false });

        return res.status(200).json({
            status: true,
            data: taxFilePrice
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// delete tax file price
exports.deletetaxFilePrice = async (req, res, next) => {
    const { id } = req.query;
    const { role } = res.locals.user;

    if (role === 'admin') {

        const taxFilePrice = await Taxfile_price.findByIdAndDelete(id);

        if (!taxFilePrice) return res.status(400).json({ message: 'Content Not found', status: false });

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


// update tax file price
exports.updateTaxFilePrice = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;

    if (role === 'admin') {
        try {
            let regularFieldsValues = {};
            regularFieldsValues.user_role = req.body.user_role
            regularFieldsValues.taxfees = req.body.taxfees
            regularFieldsValues.service_charges = req.body.service_charges
            regularFieldsValues.welcome_benefit = req.body.welcome_benefit

            delete req.body.user_role
            delete req.body.taxfees
            delete req.body.service_charges
            delete req.body.welcome_benefit

            const taxFilePrice = await Taxfile_price.findByIdAndUpdate(id, { $set: regularFieldsValues }, { validateBeforeSave: false })

            const additionalKeys = Object.keys(req.body);
            const additionalValues = Object.values(req.body);

            let additionalCharge = [];
            for (let i = 0; i < additionalKeys.length; i++) {
                additionalCharge.push(
                    {
                        additional_fee_name: additionalKeys[i],
                        additional_fee: additionalValues[i],
                    }
                )
            }

            if (additionalCharge?.length > 0) {
                await Taxfile_price.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: { additional_fees: additionalCharge } }, { validateBeforeSave: false })
            }

            if (!taxFilePrice) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            return res.status(200).json({
                status: true,
                message: "Prices updated successfully!",
                data: taxFilePrice
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


// get one tax file price
exports.taxFilePriceGetOne = async (req, res, next) => {
    const { fileName } = req.query;
    try {
        const taxFilePrice = await Taxfile_price.findOne({ user_role: fileName })

        if (!taxFilePrice) return res.status(400).json({ message: 'Content Not found', status: false });

        return res.status(200).json({
            status: true,
            data: taxFilePrice
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};