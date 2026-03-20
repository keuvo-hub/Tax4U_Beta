const Province = require('../models/province');
const crypto = require('crypto');
const mongoose = require('mongoose')


// create Province Code
exports.createProvince = async (req, res, next) => {
    const { id, role } = res.locals.user;

    if (role === 'admin' || role === 'accountant') {

        try {

            const ID = await crypto.randomBytes(2).toString('hex');

            req.body.ID = ID

            const newProvince = await Province.create(req.body);

            if (!newProvince) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            res.status(200).json({
                status: true,
                message: "Province created successfully",
                data: newProvince
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


// get Province Code
exports.getOneProvince = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;

    if (role === 'admin' || role === 'accountant') {

        try {
            const province = await Province.findOne({ _id: mongoose.Types.ObjectId(id) })

            if (!province) return res.status(404).json({ message: 'Province Not found', status: false });

            res.status(200).json({
                status: true,
                data: province
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
};


// get all Province Code
exports.getAllProvince = async (req, res, next) => {
    const { id, role } = res.locals.user;
    const { query } = req;

    try {
        const provinces = await Province.paginate({
            $or: [
                { name: { $regex: new RegExp(query.searchValue, "i") } },
                { user_role: { $regex: new RegExp(query.searchValue, "i") } },
            ]
        }, {
            page: query.page || 1,
            limit: query.size || 20,
            sort: { createdAt: -1 },
        })

        if (provinces?.docs?.length == 0) return res.status(404).json({ message: 'Province Not found', status: false });

        res.status(200).json({
            status: true,
            error: false,
            data: provinces
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// delete Province code
exports.deleteProvince = async (req, res, next) => {
    const { id } = req.query;
    const { role } = res.locals.user;

    if (role === 'admin') {

        try {
            const province = await Province.findByIdAndDelete(id);

            if (!province) return res.status(404).json({ message: 'Province Not found', status: false });

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


// update province code
exports.updateProvince = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;

    if (role === 'admin') {

        try {
            const province = await Province.findByIdAndUpdate(id, { $set: req.body }, { validateBeforeSave: false })

            if (!province) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            res.status(200).json({
                status: true,
                message: "Province infomation updated successfully!",
                data: province
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


// getAllProvinceByRole
// getAllProvinceByRole
exports.getAllProvinceByRole = async (req, res, next) => {
    const { role } = res.locals.user;
    const { query } = req;

    try {

        const filter = {
            $or: [
                { user_role: role },
                { user_role: 'all' },
                { user_role: '' },
                { user_role: null },
                { user_role: { $exists: false } }
            ]
        };

        if (query.searchValue) {
            filter.$and = [
                {
                    $or: [
                        { name: { $regex: new RegExp(query.searchValue, "i") } },
                        { user_role: { $regex: new RegExp(query.searchValue, "i") } },
                    ]
                }
            ];
        }

        const provinces = await Province.paginate(filter, {
            page: query.page || 1,
            limit: query.size || 200,
            sort: { name: 1 },
        });

        if (provinces?.docs?.length === 0)
            return res.status(404).json({ message: 'Province Not found', status: false });

        res.status(200).json({
            status: true,
            error: false,
            data: provinces
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};
