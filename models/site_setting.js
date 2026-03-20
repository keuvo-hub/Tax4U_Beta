const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

// schema design
const siteSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    username: {
        type: String,
        trim: true,
        minlength: 0,
        lowercase: true,
    },
    logo: {
        type: String,
        minlength: 0,
        trim: true,
    },
    contact_number: {
        type: String,
        trim: true,
        minlength: 0,
    },
    contact_email: {
        type: String,
        trim: true,
        minlength: 0,
        lowercase: true,
    },
    working_time: [
        {
            type: String,
            trim: true,
            minlength: 0,
            lowercase: true,
        }
    ],
    working_day: [
        {
            type: String,
            trim: true,
            minlength: 0,
            lowercase: true,
        }
    ],
    facebook: {
        type: String,
        trim: true,
        minlength: 0,
    },
    twitter: {
        type: String,
        trim: true,
        minlength: 0,
    },
    instagram: {
        type: String,
        trim: true,
        minlength: 0,
    },
    linkedIn: {
        type: String,
        trim: true,
        minlength: 0,
    },
    socket_url: {
        type: String,
        trim: true,
        minlength: 0,
    },
    whatsapp: {
        type: String,
        trim: true,
        minlength: 0,
    },
    fax: {
        type: String,
        trim: true,
        minlength: 0,
    },
    office_address: {
        type: String,
        trim: true,
        minlength: 0,
    },
    website: {
        type: String,
        trim: true,
        minlength: 0,
    },
    update_version: {
        number: {
            type: String,
            enum: ['v1', 'v2', 'v3'],
            default: 'v1'
        },
        theme: {
            type: String,
            enum: ['one', 'two', 'three'],
            default: 'one'
        },
    },
    recaptcha: {
        login_recaptcha: {
            type: Boolean,
            default: false
        },
        register_recaptcha: {
            type: Boolean,
            default: false
        },
        site_key: String
    },
    expert_member: Number,
    total_user: Number,
    per_month_filled: Number,
    year_of_experience: Number,
}, {
    timestamps: true
});

siteSchema.plugin(paginate)
const Site_setting = mongoose.model("Site_setting", siteSchema);

module.exports = Site_setting;
