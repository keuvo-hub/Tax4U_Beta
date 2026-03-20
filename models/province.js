const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

// schema design
const provinceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 0,
        maxlength: 200,
        lowercase: true,
    },
    ID: {
        type: String,
        required: true,
        minlength: 0,
        unique: true
    },
    tax_info: [
        {
            tax_name: { type: String, trim: true },
            tax_percentage: { type: Number, default: 0 }
        }
    ],
    user_role: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

provinceSchema.plugin(paginate)
const Province = mongoose.model("Province", provinceSchema);

module.exports = Province;
