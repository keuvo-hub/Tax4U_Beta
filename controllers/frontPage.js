const crypto = require('crypto');
const mongoose = require('mongoose')
const FrontPage = require('../models/frontPage');
const Site_setting = require('../models/site_setting');
const Service_blog = require('../models/service_blog');

// create front page
exports.createFrontPage = async (req, res, next) => {
    const { id, role } = res.locals.user;

    if (role === 'admin') {

        try {
            const { name, type, contents } = req.body;

            const ID = await crypto.randomBytes(2).toString('hex');

            const newpage = await FrontPage.create({ name, ID, type, contents });
    
            if (!newpage) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            res.status(200).json({
                status: true,
                message: "FrontPage created successfully",
                data: newpage
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


// get frontPage Code
exports.getOneFrontPage = async (req, res, next) => {
    const { id } = req.query;

    try {
        const frontPage = await FrontPage.findOne({ _id: mongoose.Types.ObjectId(id) })

        if (!frontPage) return res.status(404).json({ message: 'frontPage Not found', status: false });

        res.status(200).json({
            status: true,
            data: frontPage
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
};

exports.getHomePageFromDB = async (req, res) => {
    try {
        const themeVersion = await Site_setting.findOne({}).select("update_version").lean();
        if (!themeVersion) return res.status(404).json({ message: 'Theme version not found!', status: false });
        const data = await Service_blog.aggregate([
            {
                $match: {
                    "themeData.version": themeVersion.update_version.number,
                    "themeData.theme": themeVersion.update_version.theme,
                }
            },
            {
                $lookup: {
                    from: "feedbacks",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                let: { user: "$user" },
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
                                            firstName: 1,
                                            lastName: 1,
                                            profile_img: 1,
                                            role: 1,
                                            city: 1,
                                        }
                                    },
                                ],
                                as: "user"
                            }
                        },
                        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                __v: 0,
                            }
                        },
                        { $limit: 10 },
                    ],
                    as: "testimonials"
                }
            },
            {
                $lookup: {
                    from: "site_content_abouts",
                    pipeline: [
                        {
                            $project: {
                                executive_team: 1,
                                accounting_affiliates: 1,
                            }
                        },
                    ],
                    as: "team_members"
                }
            },
            { $unwind: { path: "$team_members", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "faqs",
                    pipeline: [
                        {
                            $project: {
                                __v: 0,
                            }
                        },
                    ],
                    as: "faqs"
                }
            },
        ]);
        return res.status(200).json({
            status: true,
            data: data[0]
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};

// get all FrontPage Code
exports.getAllFrontPage = async (req, res, next) => {
    try {
        const frontPages = await FrontPage.paginate({}, { sort: { createdAt: -1 } })

        if (frontPages?.docs?.length == 0) return res.status(404).json({ message: 'frontPage Not found', status: false });

        res.status(200).json({
            status: true,
            error: false,
            data: frontPages
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// delete frontPage code
exports.deleteFrontPage = async (req, res, next) => {
    const { id } = req.query;
    const { role } = res.locals.user;

    if (role === 'admin') {

        try {
            const frontPage = await FrontPage.findByIdAndDelete(id);

            if (!frontPage) return res.status(404).json({ message: 'frontPage Not found', status: false });

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


// update frontPage code
exports.updateFrontPage = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;

    if (role === 'admin') {

        try {
            const frontPage = await FrontPage.findByIdAndUpdate(id, { $set: req.body }, { validateBeforeSave: false })

            if (!frontPage) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            res.status(200).json({
                status: true,
                message: "frontPage infomation updated successfully!",
                data: frontPage
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