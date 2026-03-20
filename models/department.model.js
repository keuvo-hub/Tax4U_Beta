const {model, Schema} = require('mongoose');
const paginate = require("mongoose-paginate-v2")
const aggregatePaginate = require("mongoose-aggregate-paginate-v2")

let schema = new Schema({
        name: {
            type: String,
            unique: true,
        },
        image: String,
        active: {
            type: Boolean,
            default: true
        },
        description: String,
        parent: {
            type: Schema.Types.ObjectId,
            ref: 'department',
        }
    }, {timestamps: true}
)

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Department = model('department', schema)
module.exports = Department