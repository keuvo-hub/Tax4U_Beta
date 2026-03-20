const {model, Schema} = require('mongoose');
const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2")
const aggregatePaginate = require("mongoose-aggregate-paginate-v2")

// schema design
const schema = new mongoose.Schema({
    employee_key: {
        type: String,
    },
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    restaurant_id: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant'
    },
    start_time: Date,
    end_time: Date,
    date: Date,
    break_time_start: Date,
    break_time_end: Date,
    status: {
        type: String,
        enum: ['completed','in','out'],
        default: 'completed',
    },
   
}, {
    timestamps: true
});

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Attendance = mongoose.model("attendance", schema);

module.exports = Attendance;
