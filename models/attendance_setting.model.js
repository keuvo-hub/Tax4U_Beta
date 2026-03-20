const {model, Schema} = require('mongoose');
const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2")
const aggregatePaginate = require("mongoose-aggregate-paginate-v2")

// schema design
const schema = new mongoose.Schema({
    start_work: Date,
    end_work: Date,
    start_break: Date,
    end_break: Date,
    weekends: [String],

}, {
    timestamps: true
});

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const AttendanceSetting = mongoose.model("attendance_setting", schema);

module.exports = AttendanceSetting;
