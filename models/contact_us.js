const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

// schema design
const contactUsSchema = new mongoose.Schema({
    firstname: {
        type: String,
        trim: true,
        minlength: 0,
        maxlength: 300,
    },
    lastname: {
        type: String,
        trim: true,
        minlength: 0,
        maxlength: 300,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 0,
        maxlength: 300,
    },
    subject: {
        type: String,
        trim: true,
        minlength: 0,
        maxlength: 300,
        required: true,
    },
    message: {
        type: String,
        trim: true,
        minlength: 0,
        maxlength: 1000,
        required: true,
    },
    status: {
        type: String,
        default: 'pending'
    },
    phone: {
        type: String,
        minlength: 0,
        maxlength: 100
    }

}, {
    timestamps: true
});

contactUsSchema.plugin(paginate)
const ContactUs = mongoose.model("ContactUs", contactUsSchema);

module.exports = ContactUs;
