const {model, Schema} = require('mongoose');
const paginate = require("mongoose-paginate-v2")
const aggregatePaginate = require("mongoose-aggregate-paginate-v2")
const mongoose = require("mongoose");

// schema design
const schema = new mongoose.Schema({
    day: String,
    opening_time: Date,
    closing_time: Date,
    status: {
        type: Boolean,
        default: true
    },
    manager: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant'
    },
}, {
    timestamps: true
});

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const OperatingTime = mongoose.model("operating_time", schema);

module.exports = OperatingTime;
