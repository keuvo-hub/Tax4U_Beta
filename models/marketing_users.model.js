const {model, Schema} = require('mongoose')
const paginate = require("mongoose-paginate-v2");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')

let schema = new Schema({
    name: String,

    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },

    marketing_status: {
        type: String,
        default: 'active',
        enum: ['active', 'banned']
    },
}, {timestamps: true})

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const MarketingUser = model('marketing_user', schema)

module.exports =  MarketingUser
