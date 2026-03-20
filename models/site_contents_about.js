const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

// schema design
const siteContentAboutSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        minlength: 0,
        maxlength: 100,
    },
    title: {
        type: String,
        trim: true,
        minlength: 0,
        maxlength: 300,
    },
    about: {
        type: String,
        minlength: 0,
        trim: true,
        maxlength: 500,
    },
    our_goal: {
        type: String,
        trim: true,
        minlength: 0,
    },
    executive_team: [
        {
            user: {
                short_brief: {type: String, trim: true},
                linkedIn: {type: String, trim: true},
                twitter: {type: String, trim: true},
                facebook: {type: String, trim: true},
                first_name: {type: String, trim: true},
                last_name: {type: String, trim: true},
                image: {type: String, trim: true},
                
            },
            title: {
                type: String,
                trim: true
            },
            university: {
                type: String,
                trim: true
            }
        }

    ],
    accounting_affiliates: [
        {
            user: {
                short_brief: {type: String, trim: true},
                linkedIn: {type: String, trim: true},
                twitter: {type: String, trim: true},
                facebook: {type: String, trim: true},
                first_name: {type: String, trim: true},
                last_name: {type: String, trim: true},
                image: {type: String, trim: true},
                
            },
            title: {
                type: String,
                trim: true
            },
            university: {
                type: String,
                trim: true
            }
        }

    ],
    photo_gallery: [
        {
            image: {
                type: 'String',
                minlength: 0,
                trim: true,
            },
            title: {
                type: 'String',
                minlength: 0,
                trim: true,
            },
            deatils: {
                type: 'String',
                minlength: 0,
                trim: true,
            }
        }
    ]
}, {
    timestamps: true
});

siteContentAboutSchema.plugin(paginate)
const Site_content_about = mongoose.model("Site_content_about", siteContentAboutSchema);

module.exports = Site_content_about;
