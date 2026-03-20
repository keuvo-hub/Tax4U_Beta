const {model, Schema} = require('mongoose')
const paginate = require("mongoose-paginate-v2");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')

let schema = new Schema({
    individual_number: String,
    group: {type: Schema.Types.ObjectId,ref:'marketing_group'},
    status: {
        type: String,
        default: 'pending'
    },
    scheduled_date: String,
    subject: String,
    content: String,
    from: String,

    driver: Boolean,
    user: Boolean,
    employee: Boolean,
    to:{
        type:[],
        default:[]
    }

}, {timestamps: true})

schema.plugin(paginate);
schema.plugin(aggregatePaginate);
const MarketingSms = model('marketing_sms', schema)

module.exports =  MarketingSms
