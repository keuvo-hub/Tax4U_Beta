const {model, Schema} = require('mongoose');
const paginate = require("mongoose-paginate-v2")
const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2")

// schema design
const schema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
    },
    start_date: Date,
    end_date: Date,
}, {
    timestamps: true
});

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Holiday = mongoose.model("holiday", schema);

module.exports = Holiday;
