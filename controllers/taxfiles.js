const mongoose = require('mongoose');
const Taxfile = require('../models/taxfile');
const User = require('../models/user');
const crypto = require('crypto');
const {s3Upload} = require('../utils/awsS3Bucket');
const assignedEmailUserAndAC = require('../utils/assignedEmailUserAC');
const assignedEmailToAC = require('../utils/assignedEmailAC');
const finalEmailToUser = require('../utils/FinalTaxFileSendUser');
const finalEmailToAdminsAndAC = require('../utils/FinalTaxFileSendAdminAndAc');
const UserRole = require('../models/user_role')
const Pdf_excel_data = require("../models/pdf_excel_data");
const Site_setting = require('../models/site_setting');
const mailConfig2 = require("../utils/userEmailSend");


// create Taxfile
exports.createTaxfile = async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction();

    try {
        const {id} = res.locals.user;
        const ID = crypto.randomBytes(4).toString('hex')

        const form_other_info = req.body.other_info;
        form_other_info.user = id;
        form_other_info.ID = ID;

        delete req.body['other_info'];

        const newTaxfile = await Taxfile.create([form_other_info], {session});
        await Taxfile.updateOne({_id: newTaxfile[0]?._id}, {$set: {step_one_info: [req.body]}}, {session});

        if (!newTaxfile) return res.status(400).json({message: 'Wrong input! try again..', status: false});

        await session.commitTransaction()

        return res.status(200).json({
            status: true,
            message: "Taxfile created successfully",
            data: newTaxfile[0]
        })

    } catch (error) {
        await session.abortTransaction()
        return res.status(500).json({
            status: false,
            message: error.message
        })

    } finally {
        await session.endSession()
    }
}


// get Taxfile
exports.getOneTaxfile = async (req, res, next) => {
    try {
        const {id} = req.query;

        const taxFile = await Taxfile.findOne({_id: new mongoose.Types.ObjectId(id)}).populate('user', '-password' +
            ' -__v -otp').populate('province_name', '-__v').populate('assigned_accountant')

        if (!taxFile) return res.status(400).json({message: 'TaxFile Not found', status: false});

        return res.status(200).json({
            status: true,
            data: taxFile
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }

};


// get all Taxfile
exports.getAllTaxfile = async (req, res, next) => {
    const {query} = req;
    try {
        const taxFiles = await Taxfile?.aggregatePaginate(Taxfile.aggregate([
            {
                $match: {_id: {$exists: true}},
            },
            {
                $lookup: {
                    from: "users",
                    localField: "assigned_accountant",
                    foreignField: "_id",
                    as: "assigned_accountant"
                }
            },
            {$unwind: {path: '$assigned_accountant', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "provinces",
                    localField: "province_name",
                    foreignField: "_id",
                    as: "province_name"
                }
            },
            {$unwind: {path: '$province_name', preserveNullAndEmptyArrays: true}},
            {
                $match: {
                    $or: [
                        {first_name: {$regex: new RegExp(query.searchValue, "i")}},
                        {last_name: {$regex: new RegExp(query.searchValue, "i")}},
                        {ID: {$regex: new RegExp(query.searchValue, "i")}},
                        {phone_number: {$regex: new RegExp(query.searchValue, "i")}},
                        {taxfile_status: {$regex: new RegExp(query.searchValue, "i")}},
                        {address: {$regex: new RegExp(query.searchValue, "i")}},
                        {taxfile_status_admin: {$regex: new RegExp(query.searchValue, "i")}},
                        {"assigned_accountant.username": {$regex: new RegExp(query.searchValue, "i")}},
                        {"province_name.name": {$regex: new RegExp(query.searchValue, "i")}},
                        {steps: {$regex: new RegExp(query.searchValue, "i")}},
                    ]
                },
            },
            {
                $sort: query?.sortData === 'name' && {first_name: 1} ||
                    query?.sortData === 'accountant' && {"assigned_accountant.username": 1} ||
                    query?.sortData === 'updatedAt' && {updatedAt: -1} ||
                    query?.sortData === 'createdAt' && {createdAt: 1} ||
                    query?.sortData === 'city' && {"province_name.name": 1} ||
                    query?.sortData === 'phone' && {phone_number: 1} ||
                    query?.sortData === 'status' && {taxfile_status_admin: 1} ||
                    query?.sortData === 'payment' && {stripe_payment: 1} ||
                    query?.sortData === 'step' && {steps: 1} ||
                    {createdAt: -1}
            }
        ], {
            collation: {
                locale: "en", caseLevel: true
            }

        }), {
            page: query.page || 1,
            limit: req.query.numberOfRow || query.size || 20,
        })

        return res.status(200).json({
            status: true,
            error: false,
            data: taxFiles
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// delete Taxfile
exports.deleteTaxfile = async (req, res, next) => {
    const {id} = req.query;
    const {role} = res.locals.user;

    try {
        const taxFile = await Taxfile.findByIdAndDelete(id);

        if (!taxFile) return res.status(400).json({message: 'TaxFile Not found', status: false});

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
}


// update Taxfile
exports.updateTaxfile = async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction();

    const {role} = res.locals.user;
    const {id} = req.query;

    try {
        let taxFileUpdate1, taxFileUpdate2;

        if (req.body?.other_info?.steps === 2) {
            const form_other_info = req.body.other_info;
            delete req.body['other_info'];

            taxFileUpdate1 = await Taxfile.findByIdAndUpdate(id, {$set: form_other_info}, {
                validateBeforeSave: false,
                session
            })

            taxFileUpdate2 = await Taxfile.findByIdAndUpdate(id, {$set: {step_two_info: [req.body]}}, {
                validateBeforeSave: false,
                session
            })

await Taxfile.findByIdAndUpdate(id, {
    $set: {
        "step3_ai.enabled": true,
        "step3_ai.trigger_source": "save_next_step3",
        "step3_ai.status": "step3_triggered",
        "step3_ai.last_analysis_at": new Date()
    }
}, {
    validateBeforeSave: false,
    session
})


if (!taxFileUpdate1 || !taxFileUpdate2) return res.status(400).json({
                message: 'Wrong input! try again..',
                status: false
            });

            await session.commitTransaction();


        } else {
            taxFileUpdate1 = await Taxfile.findByIdAndUpdate(id, {$set: req.body}, {validateBeforeSave: false})

            if (!taxFileUpdate1) return res.status(400).json({message: 'Wrong input! try again..', status: false});

        }

        return res.status(200).json({
            status: true,
            message: "TaxFile information updated successfully!",
            data: taxFileUpdate1
        })

    } catch (error) {
        await session.abortTransaction();
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        })

    } finally {
        await session.endSession();
    }
}


// get all Taxfile according to user
exports.getAllByUserwiseTaxfile = async (req, res, next) => {
    const {id, role} = res.locals.user;
    const {query} = req;

    try {
        let taxFiles;

        if (role === 'accountant') {
            taxFiles = await Taxfile.paginate({
                assigned_accountant: id,
                $or: [
                    {first_name: {$regex: new RegExp(query.searchValue, "i")}},
                    {last_name: {$regex: new RegExp(query.searchValue, "i")}},
                    {ID: {$regex: new RegExp(query.searchValue, "i")}},
                    {phone_number: {$regex: new RegExp(query.searchValue, "i")}},
                    {taxfile_status: {$regex: new RegExp(query.searchValue, "i")}},
                    {address: {$regex: new RegExp(query.searchValue, "i")}},
                    {"province_name.name": {$regex: new RegExp(query.searchValue, "i")}},
                ]
            }, {
                page: query.page || 1,
                limit: req.query.numberOfRow || query.size || 10,
                populate: [
                    {path: 'user', select: '-password -__v -otp'},
                    {path: 'province_name', select: '-__v'},
                    {path: 'assigned_accountant'}
                ],
                sort: query?.sortData === 'updatedAt' && {updatedAt: 1} ||
                    {createdAt: -1}
            })

        } else if (role !== 'accountant') {
            taxFiles = await Taxfile.find({user: id}).populate('user', '-password -__v -otp').populate('province_name', '-__v').sort('-updatedAt');
        }

        if (taxFiles?.docs?.length == 0) {
            return res.status(400).json({message: 'Taxfile Not found', status: false});
        }

        return res.status(200).json({
            status: true,
            error: false,
            data: taxFiles
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};

// get all Taxfile according to user
exports.getTaxfilesStatusAccountant = async (req, res, next) => {
    try {
        const {id, role} = res.locals.user;
        if (role !== 'accountant') {
            return res.status(400).json({
                error: true,
                msg: 'Authorization failed',
            })
        }
        const {query} = req;
        let filter = {};
        if (!!query.search) {
            filter = {
                $or: [
                    {first_name: {$regex: new RegExp(query.search, "i")}},
                    {last_name: {$regex: new RegExp(query.search, "i")}},
                    {ID: {$regex: new RegExp(query.search, "i")}},
                    {phone_number: {$regex: new RegExp(query.search, "i")}},
                    {taxfile_status: {$regex: new RegExp(query.search, "i")}},
                    {address: {$regex: new RegExp(query.search, "i")}},
                    {"province_name.name": {$regex: new RegExp(query.search, "i")}},
                ]
            }
        }
        const taxFiles = await Taxfile?.aggregatePaginate(Taxfile.aggregate([
            {
                $match: {assigned_accountant: id}
            },
            {
                $lookup: {
                    from: "users",
                    let: {"user": "$user"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$user"]
                                }
                            }
                        },
                        {
                            $project: {
                                password: 0,
                                __v: 0,
                                otp: 0,
                            }
                        }
                    ],
                    as: 'user'
                }
            },
            {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "users",
                    let: {"assigned_accountant": "$assigned_accountant"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$assigned_accountant"]
                                }
                            }
                        },
                        {
                            $project: {
                                password: 0,
                                __v: 0,
                                otp: 0,
                            }
                        }
                    ],
                    as: 'assigned_accountant'
                }
            },
            {$unwind: {path: '$assigned_accountant', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "provinces",
                    localField: 'province_name',
                    foreignField: '_id',
                    as: 'province_name'
                }
            },
            {$unwind: {path: '$province_name', preserveNullAndEmptyArrays: true}},
            {$match: filter},
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {updatedAt: -1},
        });

        return res.status(200).json({
            error: false,
            msg: 'success',
            data: taxFiles
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.msg
        })
    }
};


// update many Taxfile
exports.updateManyTaxfile = async (req, res, next) => {
    const {role} = res.locals.user;
    if (role === 'admin' || role === 'accountant') {
        try {

            const taxFile = await Taxfile.updateMany({_id: {$in: req.body.taxFiles}}, {
                $set: {
                    assigned_accountant: req.body.accountant,
                    progress_number: 75,
                    taxfile_status_admin: 'Submitted to Accountant'
                }
            }, {validateBeforeSave: false});

            const taxInfo = await Taxfile.aggregate([
                {
                    $match: {
                        $expr: {
                            $in: [{$toString: "$_id"}, req.body.taxFiles]
                        }
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        let: {"assigned_accountant": '$assigned_accountant'},
                        pipeline: [
                            {$match: {$expr: {$eq: ["$_id", "$$assigned_accountant"]}}},
                        ],
                        as: 'assigned_accountant'
                    }
                },
                {$unwind: {path: '$assigned_accountant', preserveNullAndEmptyArrays: true}},
                {
                    $lookup: {
                        from: 'users',
                        let: {"user": '$user'},
                        pipeline: [
                            {$match: {$expr: {$eq: ["$_id", "$$user"]}}},
                        ],
                        as: 'user'
                    }
                },
                {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
            ])

            if (!taxFile) return res.status(400).json({message: 'Wrong input! try again..', status: false});

            const fileCount = taxInfo?.length;
            let fileIDs = []

            for (let i = 0; i < taxInfo.length; i++) {
                await assignedEmailUserAndAC(taxInfo[i]);
                fileIDs.push(taxInfo[i].ID)
            }

            await assignedEmailToAC(taxInfo[0], fileCount, fileIDs);

            return res.status(200).json({
                status: true,
                message: "TaxFile information updated successfully!",
                data: taxFile
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


// update accountant
exports.fileUpload = async (req, res) => {
    const {email} = res.locals.user;

    try {
        const results = await s3Upload(req.files, email);
        const acFile = results[0].Location;

        if (!!acFile && req.body.id) {
            const updateACTaxFile = await Taxfile.updateOne(
                {_id: mongoose.Types.ObjectId(req.body.id)},
                {
                    $set: {
                        file_from_accountant: acFile,
                        taxfile_status: "completed",
                        progress_number: 100,
                        taxfile_status_admin: 'Tax Filed',
                        taken_a_review: false
                    }
                });

            const infoFileInfo = await Taxfile.findOne({_id: mongoose.Types.ObjectId(req.body.id)}).populate('assigned_accountant').populate('user');

            await finalEmailToUser(infoFileInfo);
            await finalEmailToAdminsAndAC(infoFileInfo);

            return res.status(200).json({
                status: true,
                message: "File has sent",
                data: updateACTaxFile
            })

        } else {
            return res.status(400).json({
                status: false,
                message: 'Wrong Input'
            })
        }


    } catch (err) {
        return res.status(500).json({
            status: false,
            message: err.message
        })
    }
}


// fetch completed all file
exports.completeTaxFileFromAC = async (req, res, next) => {
    const {id} = res.locals.user;
    const {query} = req;

    try {
        const taxFiles = await Taxfile.find({
            user: mongoose.Types.ObjectId(id),
            file_from_accountant: {$exists: true},
            $expr: {$gt: [{$strLenCP: '$file_from_accountant'}, 5]}
        })

        return res.status(200).json({
            status: true,
            total: taxFiles.length,
            data: taxFiles
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// update review
exports.updateReview = async (req, res, next) => {
    const {id} = req.query;

    try {
        const isLimitEx = await Taxfile.findById(id);

        if (isLimitEx.taken_review_count >= 2 && req.body.taken_a_review === true) {
            return res.status(200).json({
                status: false,
                message: "You have crossed 2 review limit",
            })
        }

        let taxFile;
        if (req.body.taken_a_review === true) {
            taxFile = await Taxfile.findByIdAndUpdate(id, {
                    taken_a_review: req.body.taken_a_review,
                    $inc: {taken_review_count: 1}
                },
                {validateBeforeSave: false})

            if (!taxFile) return res.status(400).json({message: 'Wrong input! try again..', status: false});

            return res.status(200).json({
                status: true,
                message: "You have taken a review successfully",
                data: taxFile
            })

        } else if (req.body.taken_a_review === false) {
            taxFile = await Taxfile.findByIdAndUpdate(id, {$set: req.body}, {validateBeforeSave: false})

            if (!taxFile) return res.status(400).json({message: 'Wrong input! try again..', status: false});

            return res.status(200).json({
                status: true,
                message: "Review turn off successfully",
                data: taxFile
            })

        }


    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

// fetch tax files more optimized way
exports.fetchTaxFiles = async (req, res, next) => {
    try {
        const {query} = req;
        let filtering = {}

        const taxFiles = await Taxfile?.aggregatePaginate(Taxfile.aggregate([
            {
                $match: {_id: {$exists: true}},
            },
            {
                $lookup: {
                    from: "users",
                    localField: "assigned_accountant",
                    foreignField: "_id",
                    as: "assigned_accountant"
                }
            },
            {$unwind: {path: '$assigned_accountant', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "provinces",
                    localField: "province_name",
                    foreignField: "_id",
                    as: "province_name"
                }
            },
            {$unwind: {path: '$province_name', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    ID: 1,
                    name: {
                        $concat: [
                            {$ifNull: [{$concat: ["$first_name", " "]}, '']},
                            {$ifNull: [{$concat: ["$middle_name", " "]}, '']},
                            {$ifNull: ["$last_name", '']}
                        ]
                    },
                    profile_image: 1,
                    city: {$ifNull: ["$province_name.name", 'N/A']},
                    phone: {$ifNull: ["$phone_number", 'N/A']},
                    accountant: {$ifNull: ["$assigned_accountant.username", 'N/A']},
                    steps: {$ifNull: ["$steps", 0]},
                    status: {$ifNull: ["$taxfile_status_admin", 'N/A']},
                    payment: {
                        $switch: {
                            branches: [
                                {
                                    case: {$eq: ["$stripe_payment", "paid"]}, then: "success"
                                },
                                {
                                    case: {$eq: ["$stripe_payment", "pending"]}, then: "pending"
                                },
                            ],
                            default: "pending"
                        },
                    },
                    updated: {$dateToString: {format: "%Y-%m-%d", date: "$updatedAt"}},
                    submitted: {$dateToString: {format: "%Y-%m-%d", date: "$createdAt"}},
                    createdAt: 1,
                    updatedAt: 1,
                    taken_a_review: 1,
                    taken_review_count: 1,
                    year: 1,
                }
            },
            ...(!!query.search ? [
                {
                    $match: {
                        $or: [
                            {name: {$regex: new RegExp(query.search, "i")}},
                            {ID: {$regex: new RegExp(query.search, "i")}},
                            {city: {$regex: new RegExp(query.search, "i")}},
                            {accountant: {$regex: new RegExp(query.search, "i")}},
                            {steps: (+query.search)},
                            {status: {$regex: new RegExp(query.search, "i")}},
                            {payment: {$regex: new RegExp(query.search, "i")}},
                            {updated: {$regex: new RegExp(query.search, "i")}},
                            {submitted: {$regex: new RegExp(query.search, "i")}},
                        ]
                    },
                }
            ] : []),
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {updatedAt: -1},
        });

        return res.status(200).json({
            error: false,
            data: taxFiles
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
};


// fetch tax files more optimized way
exports.fetchTaxFilesData = async (req, res, next) => {
    try {
        const {query} = req;
        const findTaxFile = await Taxfile.findOne({_id: query?._id}).populate('user', 'role').populate('province_name', 'name');
        const userRole = await UserRole.findOne({name: findTaxFile?.user?.role})
        const pdfData = await Pdf_excel_data.findOne({user_role: userRole?._id})

        const file = {...findTaxFile?._doc}
        const role = file?.user?.role
        const province_name = file?.province_name?.name
        delete file?.user
        delete file?.province_name
        const findTax = {...file, role, province_name}

        const pdf = pdfData?.pdf_excel_fields || [];
        const data = {};
        const keys = Object?.keys({...findTax, ...findTax?.step_one_info[0] || {}, ...findTax?.step_two_info[0] || {}})
        const values = Object?.values({...findTax, ...findTax?.step_one_info[0] || {}, ...findTax?.step_two_info[0] || {}})

        for (let i = 0; i < pdf.length; i++) {
            const elemMatch = pdf[i]?.input_name;
            for (let j = 0; j < keys.length; j++) {
                if (elemMatch === keys[j]) {
                    data[keys[j]] = values[j]
                }
            }
        }

        return res.status(200).json({
            error: false,
            data: {
                year: file.year,
                step_completed: file.steps,
                status: file.taxfile_status_admin,
                ...data
            }
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
};

// fetch tax files for excel download
exports.fetchTaxFilesDataForExcel = async (req, res, next) => {
    try {
        const {query, body} = req;
        const {user} = res.locals;
        let allDownload = [];
        allDownload = await Taxfile.aggregate([
            ...(!!body.files ? [
                {
                    $match: {
                        $expr: {
                            $in: [{$toString: "$_id"}, body.files]
                        }
                    },
                }
            ] : []),
            ...((user?.role === 'accountant' && !!user?.id) ? [
                {
                    $match: {
                        assigned_accountant: user?.id
                    },
                }
            ] : []),
            {
                $lookup: {
                    from: 'users',
                    let: {"user": '$user'},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$_id", "$$user"]}}},
                        {
                            $project: {
                                role: 1
                            }
                        }
                    ],
                    as: 'user'
                }
            },
            {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'provinces',
                    let: {"province_name": '$province_name'},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$_id", "$$province_name"]}}},
                        {
                            $project: {
                                name: 1
                            }
                        }
                    ],
                    as: 'province_name'
                }
            },
            {$unwind: {path: '$province_name', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'userroles',
                    let: {"role": "$user.role"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$name", "$$role"]}}},
                    ],
                    as: 'userrole'
                }
            },
            {$unwind: {path: '$userrole', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'pdf_excel_datas',
                    let: {"user_role": "$userrole._id"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$user_role", "$$user_role"]}}},
                        {
                            $project: {
                                user_role: 1,
                                pdf_excel_fields: {$ifNull: ["$pdf_excel_fields", []]},
                                createdAt: 1,
                                updatedAt: 1,
                            }
                        }
                    ],
                    as: 'pdf_excel_data'
                }
            },
            {$unwind: {path: '$pdf_excel_data', preserveNullAndEmptyArrays: true}},
            {$sort: {updatedAt: -1}},
        ])

        const docs = [];

        for (let i = 0; i < allDownload.length; i++) {
            const file = {...allDownload[i]}
            const role = file?.user?.role
            const province_name = file?.province_name?.name
            const name = (file?.first_name ?? '') + " " + (file?.middle_name ?? '') + " " + (file?.last_name ?? '')
            delete file?.user
            delete file?.province_name
            delete file?.first_name
            delete file?.last_name
            delete file?.middle_name
            const findTax = {...file, role, province_name}

            const pdf = file?.pdf_excel_data?.pdf_excel_fields || [];
            const document = {};
            const keys = Object?.keys({...findTax})
            const values = Object?.values({...findTax})

            for (let i = 0; i < pdf.length; i++) {
                const elemMatch = pdf[i]?.input_name;
                for (let j = 0; j < keys.length; j++) {
                    if (elemMatch === keys[j]) {
                        document[keys[j]] = values[j]
                    }
                }
            }
            docs.push({
                name,
                id: file?.ID,
                year: file?.year,
                payment: file?.stripe_payment,
                step_completed: file?.steps,
                taken_a_review: file?.taken_a_review,
                taken_review_count: file?.taken_review_count,
                createdAt: file?.createdAt,
                status: file?.taxfile_status_admin,
                ...document
            })
        }

        return res.status(200).json({
            error: false,
            data: docs
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
};


// fetch tax files for excel download
exports.fetchTaxFileDetails = async (req, res, next) => {
    try {
        const {query, body} = req;
        let allDownload = [];
        allDownload = await Taxfile.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(query._id)
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: {"user": '$user'},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$_id", "$$user"]}}},
                        {
                            $project: {
                                username: 1,
                                firstName: 1,
                                lastName: 1,
                                email: 1,
                                role: 1,
                                phone: 1,
                                userStatus: 1,
                                profile_img: 1,
                                description: 1,
                                display_name: 1,
                                introduction: 1,
                                createdAt: 1,
                                city: 1,
                                ID: 1,
                                country: 1,
                            }
                        }
                    ],
                    as: 'user'
                }
            },
            {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'users',
                    let: {"assigned_accountant": '$assigned_accountant'},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$_id", "$$assigned_accountant"]}}},
                        {
                            $project: {
                                username: 1,
                                firstName: 1,
                                lastName: 1,
                                email: 1,
                                role: 1,
                                phone: 1,
                                userStatus: 1,
                                profile_img: 1,
                                description: 1,
                                display_name: 1,
                                introduction: 1,
                                city: 1,
                                country: 1,
                                ID: 1,
                                createdAt: 1
                            }
                        }
                    ],
                    as: 'assigned_accountant'
                }
            },
            {$unwind: {path: '$assigned_accountant', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'provinces',
                    let: {"province_name": '$province_name'},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$_id", "$$province_name"]}}},
                        {
                            $project: {
                                name: 1
                            }
                        }
                    ],
                    as: 'province_name'
                }
            },
            {$unwind: {path: '$province_name', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'userroles',
                    let: {"role": "$user.role"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$name", "$$role"]}}},
                    ],
                    as: 'userrole'
                }
            },
            {$unwind: {path: '$userrole', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'pdf_excel_datas',
                    let: {"user_role": "$userrole._id"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$user_role", "$$user_role"]}}},
                        {
                            $project: {
                                user_role: 1,
                                pdf_excel_fields: {$ifNull: ["$pdf_excel_fields", []]},
                                createdAt: 1,
                                updatedAt: 1,
                            }
                        }
                    ],
                    as: 'pdf_excel_data'
                }
            },
            {$unwind: {path: '$pdf_excel_data', preserveNullAndEmptyArrays: true}},
            {$sort: {updatedAt: -1}},
        ])

        const docs = [];

        for (let i = 0; i < allDownload.length; i++) {
            const file = {...allDownload[i]}
            const role = file?.user?.role
            const province_name = file?.province_name?.name
            const name = (file?.first_name ?? '') + " " + (file?.middle_name ?? '') + " " + (file?.last_name ?? '')
            delete file?.province_name
            const findTax = {...file, role, province_name}

            const pdf = file?.pdf_excel_data?.pdf_excel_fields || [];
            const document = {};
            const keys = Object?.keys({...findTax, ...findTax?.step_one_info[0] || {}, ...findTax?.step_two_info[0] || {}})
            const values = Object?.values({...findTax, ...findTax?.step_one_info[0] || {}, ...findTax?.step_two_info[0] || {}})

            for (let i = 0; i < pdf.length; i++) {
                const elemMatch = pdf[i]?.input_name;
                for (let j = 0; j < keys.length; j++) {
                    if (elemMatch === keys[j]) {
                        document[keys[j]] = values[j]
                    }
                }
            }
            docs.push({
                _id: file?._id,
                name,
                ID: file?.ID,
                role: file?.user?.role,
                year: file?.year,
                progress_number: file?.progress_number,
                updatedAt: file?.updatedAt,
                assigned_accountant: file?.assigned_accountant,
                payment: file?.stripe_payment,
                step_completed: file?.steps,
                taken_a_review: file?.taken_a_review,
                taken_review_count: file?.taken_review_count,
                createdAt: file?.createdAt,
                status: file?.taxfile_status_admin,
                user: file?.user,
                document: {...document}
            })
        }

        return res.status(200).json({
            error: false,
            data: docs[0]
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
};

// transfer taxfile to another accountant
exports.transferTaxfleToAnotherAccountant = async (req, res, next) => {
    const {role} = res.locals.user;
    try {
        const {body} = req;
        if(role === "accountant" || role === "admin") {

            const updatedTaxfile = await Taxfile.findByIdAndUpdate(body?.taxfile_id, {$set: {assigned_accountant: body?.accountant_id}}, {new: true})

            // for emailing purpose
            const user = await User.findById(updatedTaxfile?.assigned_accountant).lean()
            const settings = await Site_setting.findOne().lean()
            const emailData = {
                email: user?.email,
                subject: `${process.env.WEBSITE_NAME} - you have received a new tax file`,
                message: `<h3>You have been assigned a new taxfile, id: ${updatedTaxfile?.ID} and year: ${updatedTaxfile?.year}. 
                              Please login to your account and take proper steps to complete the task. 
                          </h3>
                           <h3>For any kind of help, please contact our support team.</h3>
                           <br/>
                           Sincerely,
                           <br/>
                           ${process.env.WEBSITE_NAME} Support Team | Contact No. ${settings?.contact_number}
                        `,
            }
            await mailConfig2(emailData)

            return res.status(200).json({
                error: false,
                msg: "The file was transferred successfully",
                data: {},
            })

        } else {
            return res.status(200).json({
                error: false,
                msg: "Access permissions denied",
                data: null,
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Failed to send data, please try again"
        })
    }
};
