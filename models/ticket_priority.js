const {model, Schema} = require('mongoose');
const paginate = require("mongoose-paginate-v2");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')

const schema = new Schema({
        name: {
            type: String,
            unique: true
        },
        value: String,
        active: {
            type: Boolean,
            default: true
        }
    }, {timestamps: true}
);

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const TicketPriority = model('ticket_priority', schema);

module.exports =  TicketPriority;

