const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

// schema design
const serviceBlogSchema = new mongoose.Schema({
    header_title: {
        type: String,
        trim: true,
        minlength: 0,
        lowercase: true,
    },
    header_Sub_title_: {
        type: String,
        minlength: 0,
        trim: true,
        lowercase: true,
    },
    way_to_file_tax: [
        {
            image: {
                type: String,
                minlength: 0,
                trim: true,
            },
            title: {
                type: String,
                minlength: 0,
                trim: true,
            },
            description: {
                type: String,
                minlength: 0,
                trim: true,
            }
        }
    ],
    why: {
        type: String,
        minlength: 0,
        trim: true,
    },
    why_point1: {
        type: String,
        minlength: 0,
        trim: true,
    },
    why_point2: {
        type: String,
        minlength: 0,
        trim: true,
    },
    why_point3: {
        type: String,
        minlength: 0,
        trim: true,
    },
    why_point4: {
        type: String,
        minlength: 0,
        trim: true,
    },
    services: [
        {
            logo: {
                type: String,
                minlength: 0,
                trim: true,
            },
            title: {
                type: String,
                minlength: 0,
                trim: true,
            },
            description: {
                type: String,
                minlength: 0,
                trim: true,
            }
        }
    ],
    student_class_videos: [
        {
            type: String,
            minlength: 0,
            trim: true,
        }
    ],
    partner_ships: [
        {
            type: String,
            minlength: 0,
            trim: true,
        }
    ],
    hero_section_images: [
        {
            type: String,
            minlength: 0,
            trim: true,
        }
    ],
    file_tax_videos: [
        {
            type: String,
            minlength: 0,
            trim: true,
        }
    ],
    how_to_file_tax_title: {
        type: String,
        minlength: 0,
        trim: true,
    },
    how_to_file_tax_short_description: {
        type: String,
        minlength: 0,
        maxlength: 300,
        trim: true,
    },
    themeData: {
        version: String,
        theme: String,
    },
    corporate_strategy: {
        title: String,
        description: String,
        img1: String,
        img2: String,
        section1: String,
        section1_des: String,
        section2: String,
        section2_des: String,
    }
}, {
    timestamps: true
});

serviceBlogSchema.plugin(paginate)
const Service_blog = mongoose.model("Service_blog", serviceBlogSchema);

module.exports = Service_blog;
