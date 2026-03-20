const Pdf_excel_data = require('../models/pdf_excel_data');
const mongoose = require('mongoose');


// create Pdf_excel_data 
exports.createPdf_excel_data = async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction();

    const { user_role, add_field } = req.body;

    try {
        let newPdf_excel_data;
        const isExist = await Pdf_excel_data.findOne({user_role: mongoose.Types.ObjectId(user_role)})
 
        if(isExist?._id) {
            await Pdf_excel_data.updateOne(
                {user_role: mongoose.Types.ObjectId(user_role)}, 
                {$push: {pdf_excel_fields: add_field}}, 
            );

        } else {
            newPdf_excel_data = await Pdf_excel_data.create([{user_role: mongoose.Types.ObjectId(user_role)}], {session});

            await Pdf_excel_data.updateOne(
                {_id: newPdf_excel_data[0]._id}, 
                {$push: {pdf_excel_fields: add_field}}, 
                {session}
            );

            if (!newPdf_excel_data[0]) return res.status(400).json({ message: 'Failed to add !', status: false });
        }

        await session.commitTransaction()

        return res.status(200).json({
            status: true,
            message: "Successfully Added !",
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


// get Pdf_excel_data
exports.getOnePdf_excel_data = async (req, res, next) => {
    try {
        const { user_role } = req.query;
        const getPdf_excel_data = await Pdf_excel_data.findOne({ user_role: new mongoose.Types.ObjectId(user_role) })

        return res.status(200).json({
            status: true,
            data: getPdf_excel_data ?? {}
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// get all Pdf_excel_data
exports.getAllPdf_excel_data = async (req, res, next) => {
    const { query } = req;
    const { body } = req;

    try {
        const getAllPdf_excel_data = await Pdf_excel_data.find({})

        if (getAllPdf_excel_data?.length == 0) return res.status(404).json({ message: 'Pdf_excel_data not found', status: false,  error: false, });

        return res.status(200).json({
            status: true,
            error: false,
            data: getAllPdf_excel_data
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};


// delete Pdf_excel_data
exports.deletePdf_excel_data = async (req, res, next) => {
    const { id } = req.query;
    const { role } = res.locals.user;

    if (role === 'admin' || role === 'super_admin') {
        try {
            const delPdf_excel_data = await Pdf_excel_data.findByIdAndDelete(id);

            if (!delPdf_excel_data) return res.status(404).json({ message: 'Pdf_excel_data Not found', status: false });

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


// update Pdf_excel_data
exports.updatePdf_excel_data = async (req, res, next) => {
    const { role } = res.locals.user;
    const { id } = req.query;

        try {
            const updatePdf_excel_data = await Pdf_excel_data.updateOne(
                {user_role: mongoose.Types.ObjectId(id)},
                { $pull: {pdf_excel_fields: req.body} }, 
                { validateBeforeSave: false }
            );

            if (!updatePdf_excel_data) return res.status(400).json({ message: 'Wrong input! try again..', status: false });

            res.status(200).json({
                status: true,
                message: "Updated successfully!",
                data: updatePdf_excel_data
            })

        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            })
        }
}


