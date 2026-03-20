const MarketingGroup = require('../models/marketing_group.model')
const User = require('../models/user')
const MarketingSettings = require('../models/marketing_setting.model')
const {sendMarketingEmail} = require('../utils/marketing/deliveryMail')
const MarketingMail = require('../models/marketing_mails.model')
const MarketingUser = require('../models/marketing_users.model')
const MarketingSms = require('../models/marketing_sms.model')
const {sendTwilioMarketingSms} = require('../utils/marketing/deliverySMS')
const MarketingWhatsapp = require('../models/marketing_whatsapp.model')
const {sendWhatsappSms} = require('../utils/marketing/deliveryWhatsapp')
const mongoose = require('mongoose')

function omit(key, obj) {
    const {[key]: omitted, ...rest} = obj;
    return rest;
}

// group CRUD functions
exports.getMarketingGroups = async (req, res) => {
    const {query} = req;
    if (query._id) {
        try {
            // @ts-ignore
            const _id = new mongoose.Types.ObjectId(query._id);
            //parameters for pagination
            const page = query.page && parseInt(query.page) > 0 ? parseInt(query.page) : 1;
            const limit = parseInt(query.size ? query.size : (50)); //max size for each page, (2 ** 53 - 1) means get all  ; using 50 for saving server resources
            const skip = parseInt((page - 1) * limit)

            //get total docs in groups
            let totalDocs = await MarketingGroup.findById(_id).populate('groups', ('_ID'))
            totalDocs = totalDocs?.groups?.length || 0
            let data = await MarketingGroup.findById(_id).populate('groups', ('username email phone'))
            data.groups = data?.groups.slice(skip, skip + limit)

            const payload = {_id: mongoose.Types.ObjectId, name: '', docs: []};
            // @ts-ignore
            payload._id = _id
            payload.name = data?.name || ''
            payload.docs = data?.groups || ''
            payload.totalDocs = totalDocs
            payload.totalPages = Math.ceil(totalDocs / limit)

            //search filters
            const filters = {}
            if (query.search) {
                filters['name'] = new RegExp(query.search, 'i');
                filters['email'] = new RegExp(query.search, 'i');
                filters['phone'] = new RegExp(query.search, 'i');
            }

            //filter data
            payload.docs = payload.docs.filter((item) => {
                return item.username.match(filters['name']) || item.email.match(filters['email']) || String(item.phone).match(filters['phone'])
                }
            )

            return res.status(200).send({
                error: false,
                msg: "Fetch Successful",
                data: payload,
            })
        } catch (err) {
            console.log('This error occurred in getMarketingGroups function', err);
            return res.status(500).send({
                error: true,
                msg: "Server failed"
            })
        }

    } else {
        try {
            let data = []

            if (req.query.type === "email") {
                if (req.query.status === 'true') {
                    data = await MarketingGroup.find({type: "email", status: true})
                } else {
                    data = await MarketingGroup.find({type: "email"})
                }
            } else if (req.query.type === "sms") {
                if (req.query.status === 'true') {
                    data = await MarketingGroup.find({type: "sms", status: true})
                } else {
                    data = await MarketingGroup.find({type: "sms"})
                }
            } else if (req.query.type === "whatsapp_sms") {
                if (req.query.status === 'true') {
                    data = await MarketingGroup.find({type: "whatsapp_sms", status: true})
                } else {
                    data = await MarketingGroup.find({type: "whatsapp_sms"})
                }
            } else if (req.query.type === "notification") {
                if (req.query.status === 'true') {
                    data = await MarketingGroup.find({type: "notification", status: true})
                } else {
                    data = await MarketingGroup.find({type: "notification"})
                }
            }

            //query match and filter query.search
            //define seach filter
            let filters = {}
            if (query.search) {
                filters['name'] = new RegExp(query.search, 'i');
            }

            data = data.filter((item) => {
                    return item.name.match(filters['name'])
                }
            )

            return res.status(200).send({
                error: false,
                msg: "Fetch Successful",
                data: data
            })
        } catch (err) {
            console.log('This error occurred in getMarketingGroups function');
            return res.status(500).send({
                error: true,
                msg: "Server failed"
            })
        }
    }
}


exports.postMarketingGroups = async (req, res) => {

    const {body} = req;

    if (body._id !== '') {
        try {
            await MarketingGroup.findByIdAndUpdate(body._id, body, {new: true});
            return res.status(200).send({
                error: false,
                msg: "Update Successful",
            })
        } catch (err) {
            console.log(err.message);
            return res.status(500).send({
                error: true,
                msg: "Server failed"
            })
        }

    } else {
        try {
            // check no duplicate name the create group
            const data = await MarketingGroup.find({name: body.name});
            if (data.length > 0) {
                return res.status(400).send({
                    error: true,
                    msg: "Group name already exist",
                })
            } else {
                await MarketingGroup.create({name: body.name, groups: [], active: true, type: body.type});
                return res.status(200).send({
                    error: false,
                    msg: "Successfully Created Group",
                })
            }
        } catch (err) {
            console.log(err.message);
            return res.status(500).send({
                error: true,
                msg: "Server failed"
            })
        }
    }
}

exports.delMarketingGroups = async (req, res) => {
    try {
        await MarketingGroup.findByIdAndDelete(req.query._id);
        return res.status(200).send({
            error: false,
            msg: "Delete Successful",
        })
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            error: true,
            msg: "Server failed"
        })
    }
}

//Marketing Users Routes
exports.getSubscribedUsers = async (req, res) => {
    const {query} = req;
    const page = query.page ? query.page : 1;
    const size = Number(query.size ? query.size : (2 ** 53 - 1)); //max size for each page, (2 ** 53 - 1) means get all users
    const skip = Number((page - 1) * size)

    //define match stage
    const matchStage = {email: {$ne: null}}
    //define search stage
    const searchStage = query.search ? {
        $or: [
            {name: {$regex: query.search, $options: 'i'}},
            {email: {$regex: query.search, $options: 'i'}}
        ]
    } : {}

    try {
        let users = await MarketingUser.aggregate([
            {
                $match: searchStage
            },
            {
                $facet: {
                    docs: [
                        {
                            //only include these fields
                            $project: {
                                name: 1,
                                email: 1,
                                marketing_status: 1,
                                createdAt: 1,
                            }
                        },
                        {$skip: skip},
                        {$limit: size}
                    ],
                    totalDocs: [{
                        $count: 'createdAt'
                    }],
                }
            },
            {
                $project: {
                    docs: 1,
                    totalPages: {
                        $ceil: {
                            $divide: [
                                {$first: '$totalDocs.createdAt'},
                                size
                            ]
                        }
                    },
                    totalDocs: {$first: '$totalDocs.createdAt'}
                }
            },
            {
                $addFields: {
                    page: page,
                    limit: size
                }
            }
        ])

        return res.status(200).send({
            error: false,
            msg: "Fetch Successful",
            data: users[0]
        })
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            error: true,
            msg: "Server Error ",
        })
    }
}

exports.postSubscribeUsers = async (req, res) => {
    if (req.body._id) {
        await MarketingUser.findByIdAndUpdate(req.body._id, {marketing_status: req.body.marketing_status})

        return res.status(200).send({
            error: false,
            msg: "User Updated",
        })
    } else {
        const email = req.body.email;
        const name = req.body.name ? req.body.name : '';
        if (email) {
            try {
                await MarketingUser.create({email, name})
                return res.status(200).send({
                    error: false,
                    msg: "You have successfully subscribed to our newsletter",
                })
            } catch (err) {
                return res.status(500).send({
                    error: true,
                    msg: "Already subscribed",
                })
            }
        } else {
            return res.status(400).send({
                error: true,
                msg: "Cant receive your email.Try again later",
            })
        }
    }
}


exports.getAllUsers = async (req, res) => {
    const {query} = req;
    //page size skip; used in pagination
    const page = query.page ? query.page : 1;
    const size = Number(query.size ? query.size : (2 ** 53 - 1)); //max size for each page, (2 ** 53 - 1) means get all users
    const skip = Number((page - 1) * size)

    //define match stage
    const matchStage = query.marketing_status ? {
        role: {$in: ['user', 'driver', 'employee']},
        marketing_status: query.marketing_status
    } : {
        role: {$in: ['user', 'driver', 'employee']}
    }
    //define search stage
    const searchStage = query.search ? {
        $or: [
            {name: {$regex: new RegExp(query.search.toLowerCase(), 'i')}},
            {email: {$regex: new RegExp(query.search.toLowerCase(), 'i')}},
            {phone: {$regex: new RegExp(query.search.toLowerCase(), 'i')}},
        ]
    } : {}

    try {
        let users = await User.aggregate([
            {
                $match: matchStage
            },
            {
                $match: searchStage
            },
            {
                $facet: {
                    docs: [
                        {
                            //only include these fields
                            $project: {
                                username: 1,
                                phone: 1,
                                email: 1,
                                marketing_status: 1,
                                createdAt: 1,
                            }
                        },
                        {$skip: skip},
                        {$limit: size}
                    ],
                    totalDocs: [{
                        $count: 'createdAt'
                    }],
                }
            },
            {
                $project: {
                    docs: 1,
                    totalDocs: {$first: '$totalDocs.createdAt'},
                    totalPages: {
                        $ceil: {
                            $divide: [
                                {$first: '$totalDocs.createdAt'},
                                size
                            ]
                        }
                    },
                }
            },
            {
                $addFields: {
                    page: page,
                    limit: size
                }
            }
        ])

        return res.status(200).send({
            error: false,
            msg: "Fetch Successful",
            data: users[0]
        })
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            error: true,
            msg: "Server Error ",
        })
    }
}


exports.postAllUsers = async (req, res) => {
    const _id = req.body._id;
    if (_id) {
        try {
            let users = await User.findByIdAndUpdate(_id, {marketing_status: req.body.marketing_status})
            return res.status(200).send({
                error: false,
                msg: "User Updated",
                data: users
            })
        } catch (err) {
            return res.status(500).send({
                error: true,
                msg: "Server Error ",
            })
        }
    } else {
        return res.status(500).send({
            error: true,
            msg: "Server Error ",
        })
    }

}

exports.getAvailableUsers = async (req, res) => {
    const {query} = req;
    if (req.query._id) {
        const data = await MarketingGroup.findById(req.query._id, 'groups')
        let filter = {};
        if (query.search) {
            filter = {
                $or: [
                    {name: {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {phone: {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {email: {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        const users = await User.aggregatePaginate(
            User.aggregate(
                [
                    {$match: {_id: {$nin: data?.groups}}},
                    {$project: {username: 1, phone: 1, email: 1}},
                    {$match: filter},
                    {$sort: {createdAt: -1}}
                ]
            ),
            {
                page: query.page || 1,
                limit: query.size || 20,
            });

        return res.status(200).send({
            error: false,
            msg: "Fetch Successful",
            data: users
        })
    } else {
        return res.status(403).send({
            error: true,
            msg: "Invalid Request"
        })
    }
}

exports.postUsers = async (req, res) => {
    if (req.body._id) {
        //first check delete
        if (req.body.delete) {
            await MarketingGroup.updateOne({_id: req.body._id}, {$pull: {groups: req.body.userId}});
            return res.status(200).send({
                error: false,
                msg: "User Deleted",
            })
        }
        const find = await MarketingGroup.findById(req.body._id, 'groups')
        if (Array.isArray(req.body.userId)) {
            req.body.userId.map((userId) => {
                find.groups.push(userId)
            })
            await find.save()
        } else {
            find.groups.push(req.body.userId)
            await find.save()
        }

        return res.status(200).send({
            error: false,
            msg: "User Added TO Group",

        })
    } else {
        return res.status(403).send({
            error: true,
            msg: "Invalid Request"
        })
    }

}


// emails configuration & send apis
exports.getSettings = async (req, res) => {
    try {
        let settings = await MarketingSettings.findOne()
        return res.status(200).send({
            error: false,
            msg: 'Successfully gets settings',
            data: settings
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

exports.updateSettings = async (req, res) => {
    try {
        let {body} = req
        if (!!req.body.email) {
            const key = Object.keys(body.email)[0]

            if (req.body.email.default === true) {
                await MarketingSettings.findOneAndUpdate(
                    {},
                    {$set: {"email.default": key}},
                    {upsert: true, new: true}
                );
            }
            switch (key) {
                case 'sendgrid':
                    await MarketingSettings.findOneAndUpdate(
                        {},
                        {$set: {"email.sendgrid": body.email.sendgrid}},
                        {upsert: true, new: true}
                    );
                    return res.status(200).send({
                        error: false,
                        msg: 'Successfully updated settings'
                    })
                case 'gmail':
                    await MarketingSettings.findOneAndUpdate(
                        {},
                        {$set: {"email.gmail": body.email.gmail}},
                        {upsert: true, new: true}
                    );
                    return res.status(200).send({
                        error: false,
                        msg: 'Successfully updated settings'
                    })
                case 'other':
                    await MarketingSettings.findOneAndUpdate(
                        {},
                        {$set: {"email.other": body.email.other}},
                        {upsert: true, new: true}
                    );
                    return res.status(200).send({
                        error: false,
                        msg: 'Successfully updated settings'
                    })
            }
        } else {
            await MarketingSettings.findOneAndUpdate({}, body, {upsert: true})
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated settings'
            })
        }

    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

//email routes
exports.getAllMail = async (req, res) => {
    const query = req.query;
    let filter = {};
    try {
        if (query.search) {
            filter = {
                $or: [
                    {"content": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"subject": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        let allEmails = await MarketingMail.aggregatePaginate(MarketingMail.aggregate([{$match: {status: query.status || {$exists: true}}},
                {$match: filter},
                {
                    $lookup: {
                        from: "marketing_groups", localField: "group", foreignField: "_id", as: "group"
                    }
                },
                {
                    $unwind: {
                        path: "$group",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {$unset: ["group.createdAt", "group.updatedAt", "group.type", "group.status", "group.groups", "group.__v"]},])
            , {
                page: query.page || 1,
                limit: query.size || 10,
                $match: filter,
                sort: {createdAt: -1},
            });

        return res.status(200).send({
            error: false,
            msg: "Email Sent",
            data: allEmails
        })
    } catch (e) {
        console.log(e)
    }
}

exports.postDeliveryEmail = async (req, res) => {
    //first collect all emails to send into array
    let to = [];
    //find emails for group
    if (req.body.to) {
        const group = await MarketingGroup.findById(req.body.to).populate('groups', 'email');
        //for group mail
        // @ts-ignore
        to = group.groups.map(x => x.email);
    }
    //for all subscribers
    if (req.body.subscriber) {
        const subscribers = await MarketingUser.find().select('email')
        subscribers.forEach((subscriber) => to.push(subscriber.email));
    }

    //find all users where role is user and push their email to array
    if (req.body.user) {
        const users = await User.find({role: {$exist: true}}).select('email')
        users.forEach((user) => to.push(user.email));
    }
    //for individual mail
    if (req.body.individual_mail)
        to.push(req.body.individual_mail);

    //if scheduled date is set
    if (req.body.scheduled_date) {
        await MarketingMail.create(
            {
                individual_mail: req.body.individual_mail,
                group: req.body.to,
                subscriber: req.body.subscriber,
                driver: req.body.driver,
                user: req.body.user,
                employee: req.body.employee,
                subject: req.body.subject,
                content: req.body.content,
                status: 'scheduled',
                scheduled_date: req.body.scheduled_date,
                to: to
            })
        return res.status(200).send({
            error: false,
            msg: "Email is scheduled",
        })
    } else {
        try {
            let mail = await MarketingMail.create(
                {
                    individual_mail: req.body.individual_mail,
                    group: req.body.to,
                    subject: req.body.subject,
                    content: req.body.content,
                    subscriber: req.body.subscriber === '' || false ? false : req.body.subscriber,

                    employee: req.body.employee,
                    status: 'pending',
                    to: to
                })
            //send mail
            sendMarketingEmail({
                to: to, // Change to your recipient
                subject: req.body.subject,
                content: req.body.content,
            }).then((data) => {
                if (!!data) {
                    mail.status = 'success'
                    mail.from = data.from;
                    mail.save()
                } else {
                    mail.status = 'failed'
                    mail.save()
                }
            })
        } catch (e) {
            console.log(e)
            return res.status(500).send({
                error: true,
                msg: "Server failed",
            })
        }

    }

    return res.status(200).send({
        error: false,
        msg: "Email Sent",
    })
}

exports.delDeliveryEmail = async (req, res) => {
    try {
        await MarketingMail.findByIdAndDelete(req.query._id)
        return res.status(200).send({
            error: false,
            msg: 'Successfully deleted'
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

//sms routes

exports.getAllSMS = async (req, res) => {
    const query = req.query;

    let filter = {};
    try {
        if (query.search) {
            filter = {
                $or: [
                    {"content": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        let allEmails = await MarketingSms.aggregatePaginate(MarketingSms.aggregate([{$match: {status: query.status || {$exists: true}}},
                {$match: filter}, {
                    $lookup: {
                        from: "marketing_groups", localField: "group", foreignField: "_id", as: "group"
                    }
                }, {
                    $unwind: {
                        path: "$group",
                        preserveNullAndEmptyArrays: true
                    }
                }, {$unset: ["group.createdAt", "group.updatedAt", "group.type", "group.status", "group.groups", "group.__v"]},])
            , {
                page: query.page || 1,
                limit: query.size || 10,
                $match: filter,
                sort: {createdAt: -1},
            });

        return res.status(200).send({
            error: false,
            msg: "Email Sent",
            data: allEmails
        })
    } catch (e) {
        console.log(e)
    }
}

exports.postDeliverySMS = async (req, res) => {
    //collect all numbers to send sms into array
    let to = [];
    //find group and push all numbers to array
    if (req.body.to) {
        const group = await MarketingGroup.findById(req.body.to).populate('groups', 'phone');
        //for group sms
        // @ts-ignore
        to = group.groups.map(x => x.phone);
    }
    //find all users where role is driver and push their phone to array
    if (req.body.driver) {
        const drivers = await User.find({role: 'driver'}).select('phone')
        drivers.forEach((driver) => to.push(driver.phone));
    }
    //find all users where role is employee and push their phone to array
    if (req.body.employee) {
        const employees = await User.find({role: 'employee'}).select('phone')
        employees.forEach((employee) => to.push(employee.phone));
    }
    //find all users where role is user and push their phone to array
    if (req.body.user) {
        const users = await User.find({role: 'user'}).select('phone')
        users.forEach((user) => to.push(user.phone));
    }
    //for individual sms
    if (req.body.individual_number)
        to.push(req.body.individual_number);

    if (req.body.scheduled_date) {
        await MarketingSms.create(
            {
                individual_number: req.body.individual_number,
                group: req.body.to,
                content: req.body.content,
                status: 'scheduled',
                driver: req.body.driver,
                user: req.body.user,
                employee: req.body.employee,
                scheduled_date: req.body.scheduled_date,
                to: to
            })
        return res.status(200).send({
            error: false,
            msg: "SMS is scheduled",
        })
    } else {
        let sms = await MarketingSms.create(
            {
                individual_number: req.body.individual_number,
                group: req.body.to,
                content: req.body.content,
                driver: req.body.driver,
                user: req.body.user,
                employee: req.body.employee,
                scheduled_date: req.body.scheduled_date,
                to: to,
            })

        //send sms
        sendTwilioMarketingSms(
            to,
            req.body.content,
        ).then((data) => {

            // @ts-ignore
            if (!!data) {
                sms.status = 'success'
                sms.save()
            } else {
                sms.status = 'failed'
                sms.save()
            }
        })
        return res.status(200).send({
            error: false,
            msg: "SMS Sent",
        })
    }
}


exports.delDeliverySMS = async (req, res) => {
    try {
        await MarketingSms.findByIdAndDelete(req.query._id)
        return res.status(200).send({
            error: false,
            msg: 'Successfully deleted'
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }

}

//whatsapp routes
exports.getAllWhatsappMessage = async (req, res) => {
    const query = req.query;
    let filter = {};
    try {
        if (query.search) {
            filter = {
                $or: [
                    {"content": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        let allEmails = await MarketingWhatsapp.aggregatePaginate(MarketingWhatsapp.aggregate([{$match: {status: query.status || {$exists: true}}},
                {$match: filter}, {
                    $lookup: {
                        from: "marketing_groups", localField: "group", foreignField: "_id", as: "group"
                    }
                }, {
                    $unwind: {
                        path: "$group",
                        preserveNullAndEmptyArrays: true
                    }
                }, {$unset: ["group.createdAt", "group.updatedAt", "group.type", "group.status", "group.groups", "group.__v"]},])
            , {
                page: query.page || 1,
                limit: query.size || 10,
                $match: filter,
                sort: {createdAt: -1},
            });

        return res.status(200).send({
            error: false,
            msg: "Email Sent",
            data: allEmails
        })
    } catch (e) {
        console.log(e)
    }
}

exports.postWhatsappMessage = async (req, res) => {
    //collect all phone numbers
    let to = [];
    if (req.body.to) {
        const group = await MarketingGroup.findById(req.body.to).populate('groups', 'phone');
        //for group sms
        // @ts-ignore
        to = group.groups.map(x => x.phone);
    }
    //find all users where role is driver and push their phone to array
    if (req.body.driver) {
        const drivers = await User.find({role: 'driver'}).select('phone')
        drivers.forEach((driver) => to.push(driver.phone));
    }
    //find all users where role is employee and push their phone to array
    if (req.body.employee) {
        const employees = await User.find({role: 'employee'}).select('phone')
        employees.forEach((employee) => to.push(employee.phone));
    }
    //find all users where role is user and push their phone to array
    if (req.body.user) {
        const users = await User.find({role: 'user'}).select('phone')
        users.forEach((user) => to.push(user.phone));
    }
    //for individual sms
    if (req.body.individual_number)
        to.push(req.body.individual_number);
    if (req.body.scheduled_date) {
        await MarketingWhatsapp.create(
            {
                individual_number: req.body.individual_number,
                group: req.body.to,
                content: req.body.content,
                status: 'scheduled',
                driver: req.body.driver,
                user: req.body.user,
                employee: req.body.employee,
                scheduled_date: req.body.scheduled_date,
                to: to
            })
        return res.status(200).send({
            error: false,
            msg: "SMS is scheduled",
        })
    } else {
        let sms = await MarketingWhatsapp.create(
            {
                individual_number: req.body.individual_number,
                group: req.body.to,
                content: req.body.content,
                driver: req.body.driver,
                user: req.body.user,
                employee: req.body.employee,
                scheduled_date: req.body.scheduled_date,
                to: to,
            })

        //send whatsapp message
        sendWhatsappSms(
            to,
            req.body.content,
        ).then((data) => {
            // @ts-ignore
            if (!!data) {
                sms.status = 'success'
                sms.save()
            } else {
                sms.status = 'failed'
                sms.save()
            }
        })
        return res.status(200).send({
            error: false,
            msg: "Message Sent",
        })
    }
}

exports.delWhatsappMessage = async (req, res) => {
    try {
        await MarketingWhatsapp.findByIdAndDelete(req.query._id)
        return res.status(200).send({
            error: false,
            msg: 'Successfully deleted'
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}





