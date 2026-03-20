const {model, Schema} = require('mongoose')
const paginate = require("mongoose-paginate-v2");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')

let schema = new Schema({
    individual_mail:String,
    group: {type: Schema.Types.ObjectId,ref:'marketing_group'},
    status: {
        type: String,
        default: 'pending'
    },
    scheduled_date : String,
    subject: String,
    content: String,
    from: String,
    subscriber:Boolean,
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
const MarketingMail = model('marketing_mail', schema)

module.exports =  MarketingMail
