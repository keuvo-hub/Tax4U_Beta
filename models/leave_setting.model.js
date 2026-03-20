const {model, Schema} = require('mongoose');
const paginate = require("mongoose-paginate-v2")
const aggregatePaginate = require("mongoose-aggregate-paginate-v2")
const mongoose = require("mongoose");

// schema design
const schema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
    },
    days: {
        type: Number,
        trim: true,
        required: true,
    },
    type: {
        type: String,
        trim: true,
        enum: ['paid','non_paid'],
        required: true,
    },
    icon: {
        type: String,
        trim: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true
});

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const LeaveSetting = mongoose.model("leave_setting", schema);

module.exports = LeaveSetting;
