const {model, Schema} = require('mongoose')
const paginate = require("mongoose-paginate-v2");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')

let schema = new Schema({
    type:{
        type:String,
        required:true
    },
    name: {
        unique: true,
        type: String,
        trim: true
    },
    status:{
        type: Boolean,
        default: true
    },
    groups: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true })

schema.plugin(paginate);
schema.plugin(aggregatePaginate);
const MarketingGroup = model('marketing_group', schema)

module.exports =  MarketingGroup
