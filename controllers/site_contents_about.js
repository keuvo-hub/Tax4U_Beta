const Site_content_about = require('../models/site_contents_about');
const mongoose = require('mongoose');


// create Site_content_about 
exports.createSite_content_about = async (req, res, next) => {

    if (res.locals.user.role === 'admin' || res.locals.user.role === 'super_admin') {
        try {

            const newSite_content_about = await Site_content_about.create(req.body);

            if (!newSite_content_about) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            return res.status(200).json({
                status: true,
                message: "New content has been created successfully",
                data: newSite_content_about
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


// get Site_content_about
exports.getOneSite_content_about = async (req, res, next) => {

    try {
        const getSite_content_about = await Site_content_about.findOne({})

        if (!getSite_content_about) return res.status(404).json({ message: 'Site_content_about Not found', status: false });

        return res.status(200).json({
            status: true,
            data: getSite_content_about
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// get all Site_content_about
exports.getAllSite_content_about = async (req, res, next) => {
    const { query } = req;
    const { body } = req;

    try {
        const getAllSite_content_about = await Site_content_about.find({}).sort("-createdAt")

        if (getAllSite_content_about?.length === 0) return res.status(404).json({ message: 'Site_content_abouts not found', status: false });

        return res.status(200).json({
            status: true,
            data: getAllSite_content_about
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// delete Site_content_about
exports.deleteSite_content_about = async (req, res, next) => {
    const { id } = req.query;
    const { role } = res.locals.user;

    if (role === 'admin') {

        try {
            const delSite_content_about = await Site_content_about.findByIdAndDelete(id);

            if (!delSite_content_about) return res.status(404).json({ message: 'Site_content_about Not found', status: false });

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


// update Site_content_about
exports.updateSite_content_about = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;

    if (role === 'admin') {

        try {
            const updateSite_content_about = await Site_content_about.findByIdAndUpdate(id, { $set: req.body }, { validateBeforeSave: false })

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



// update array -> Site_content_about 
exports.updateArraycontent_about = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;

    if (role === 'admin' || role === 'super_admin') {
        try {
            const updateSite_content_about = await Site_content_about.findByIdAndUpdate(id, { $push: req.body }, { validateBeforeSave: false })

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



// delete about content
exports.deleteFromArrayContentAbout = async (req, res, next) => {
    const { id } = req.query;
    const { action } = req.body;
    const { role } = res.locals.user;

    if (role === 'admin' || role === 'super_admin') {

        try {
            let delSite_content_about;
            if (action === 'executive_team') {
                console.log(req.body)
                console.log(req.query)

                delSite_content_about = await Site_content_about.updateOne(
                    { 'executive_team._id': mongoose.Types.ObjectId(id) },
                    { $pull: { executive_team: { _id: (req.query.id) } } }
                );

            } else if (action === 'accounting_affiliates') {
                delSite_content_about = await Site_content_about.updateOne(
                    { 'accounting_affiliates._id': mongoose.Types.ObjectId(id) },
                    { $pull: { accounting_affiliates: { _id: (req.query.id) } } }
                );

            } else if (action === 'photo_gallery') {
                delSite_content_about = await Site_content_about.updateOne(
                    { 'photo_gallery._id': mongoose.Types.ObjectId(id) },
                    { $pull: { photo_gallery: { _id: (req.query.id) } } }
                );

            }

            if (!delSite_content_about) return res.status(404).json({ message: 'Site Content Not found', status: false });

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