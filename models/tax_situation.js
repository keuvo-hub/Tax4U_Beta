const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

// schema design
const taxSituationSchema = new mongoose.Schema({
    user_role: {
        type: mongoose.Types.ObjectId,
        ref: 'UserRole'
    },
    hero_section_title: {
        type: String,
        trim: true,
        minlength: 0,
    },
    hero_section_title_Sub_title: {
        type: String,
        minlength: 0,
        trim: true,
    },
    hero_section_image: {
        type: String,
        trim: true,
        minlength: 0,
    },

    section_2_title: {
        type: String,
        trim: true,
        minlength: 0,

    },
    section_2_sub_title: {
        type: String,
        trim: true,
        minlength: 0,

    },
    section_2_image: {
        type: String,
        trim: true,
        minlength: 0,

    },
    section_3_title: {
        type: String,
        trim: true,
        minlength: 0,

    },
    section_3_sub_title: {
        type: String,
        trim: true,
        minlength: 0,

    },
    section_3_image: {
        type: String,
        trim: true,
        minlength: 0,

    },
    work_process_title: {
        type: String,
        minlength: 0,
        trim: true,
    },
    work_process_sub_title: {
        type: String,
        minlength: 0,
        trim: true,
    },
    work_process_description: [
        {
            processDetails: {
                type: String,
                minlength: 0,
                trim: true,
            }
        }
    ]
}, {
    timestamps: true
});

taxSituationSchema.plugin(paginate)
const Tax_situation = mongoose.model("Tax_situation", taxSituationSchema);

module.exports = Tax_situation;
