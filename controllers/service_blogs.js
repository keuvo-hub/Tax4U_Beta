const Service_blog = require('../models/service_blog');
const mongoose = require('mongoose');


// create Service_blog 
exports.createService_blog = async (req, res, next) => {

    if (res.locals.user.role === 'admin' || res.locals.user.role === 'super_admin') {
        try {

            const newService_blog = await Service_blog.create(req.body);

            if (!newService_blog) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            return res.status(200).json({
                status: true,
                message: "created successfully",
                data: newService_blog
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


// get Service_blog
exports.getOneService_blog = async (req, res, next) => {
    try {
        const getService_blog = await Service_blog.findOne({
            $and: [
                {"themeData.version": req.query.version},
                {"themeData.theme": req.query.theme},
            ]
        }).lean();
        if (!getService_blog) return res.status(404).json({ message: 'Service_blog Not found', status: false });
        return res.status(200).json({
            status: true,
            data: getService_blog
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// get all Service_blog
exports.getAllService_blog = async (req, res, next) => {
    const { query } = req;
    const { body } = req;

    try {
        const getAllService_blog = await Service_blog.find({}).sort("-createdAt")

        if (getAllService_blog?.length === 0) return res.status(404).json({ message: 'Service_blogs not found', status: false });

        return res.status(200).json({
            status: true,
            data: getAllService_blog
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// delete Service_blog
exports.deleteService_blog = async (req, res, next) => {
    const { id } = req.query;
    const { role } = res.locals.user;

    if (role === 'admin' || role === 'super_admin') {

        try {
            const delService_blog = await Service_blog.findByIdAndDelete(id);

            if (!delService_blog) return res.status(404).json({ message: 'Service_blog Not found', status: false });

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


// update Service_blog
exports.updateService_blog = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;

    if (role === 'admin' || role === 'super_admin') {

        try {
            const updateService_blog = await Service_blog.findByIdAndUpdate(id, { $set: req.body }, { validateBeforeSave: false })

            if (!updateService_blog) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            return res.status(200).json({
                status: true,
                message: "Updated successfully!",
                data: updateService_blog
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
exports.updateArraycontent_Home = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;


    if (role === 'admin' || role === 'super_admin') {

        try {
            const updateSite_content_about = await Service_blog.findByIdAndUpdate(id, { $push: req.body }, { validateBeforeSave: false })

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


// delete Service_blog
exports.deleteFromArrayService_blog = async (req, res, next) => {
    const { id, action } = req.query;
    const { role } = res.locals.user;

    console.log(req.query)


    if (role === 'admin' || role === 'super_admin') {

        try {
            let delService_blog;
            if (action === 'file_tax_videos') {
                delService_blog = await Service_blog.updateOne({ _id: id }, { $pull: { file_tax_videos: req.query.file_tax_videos } });

            } else if (action === 'partner_ships') {
                delService_blog = await Service_blog.updateOne({ _id: id }, { $pull: { partner_ships: req.query.partner_ships } });

            } else if (action === 'student_class_videos') {
                delService_blog = await Service_blog.updateOne({ _id: id }, { $pull: { student_class_videos: req.query.student_class_videos } });

            } else if (action === 'services') {
                console.log("services");
                delService_blog = await Service_blog.updateOne({ _id: id }, { $pull: { services: { _id: (req.query.services) } } });

            } else if (action === 'way_to_file_tax') {
                delService_blog = await Service_blog.updateOne({ _id: id }, { $pull: { way_to_file_tax: { _id: (req.query.way_to_file_tax) } } });

            } else if (action === 'hero_section_images') {
                delService_blog = await Service_blog.updateOne({ _id: id }, { $pull: { hero_section_images: (req.query.hero_section_images) } });

            }

            if (!delService_blog) return res.status(404).json({ message: 'Service_blog Not found', status: false });

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
