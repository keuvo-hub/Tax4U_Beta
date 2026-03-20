const {model, Schema} = require('mongoose');
const paginate = require("mongoose-paginate-v2")
const aggregatePaginate = require("mongoose-aggregate-paginate-v2")
const mongoose = require("mongoose");

// schema design
const schema = new mongoose.Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    leave: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    start_date: Date,
    end_date: Date,
    leave_days: Number,
    leave_reason: String,
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: 'pending'
    }
}, {
    timestamps: true
});

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Leave = mongoose.model("leave", schema);

module.exports = Leave;
