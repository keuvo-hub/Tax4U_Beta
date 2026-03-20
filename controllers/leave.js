const Leave = require('../models/leave.model')

// post Leave
exports.postLeave = async (req, res) => {
    try {
        const { body } = req;
        if (body._id) {
            await Leave.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });

        } else {
            await Leave.create({
                employee: body.employee,
                leave: body.leave,
                start_date: body.start_date,
                end_date: body.end_date,
                leave_days: body.leave_days,
                leave_reason: body.leave_reason,
            });
            return res.status(200).json({
                error: false,
                msg: 'Successfully created!'
            })
        }


    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({
                error: true,
                msg: 'Duplicate warning!'
            })
        }
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        })
    }
}


// get Leave
exports.getLeave = async (req, res) => {
    try {
        const { query } = req;
        let filter = {};

        if (query._id) {
            const leave = await Leave.findById(query._id);
            return res.status(200).json({
                error: false,
                data: leave
            })

        } else {
            if (query.search) {
                filter = {
                    $or: [
                        { name: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                        { leave: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                        { type: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                        { status: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                        { days: Number(query.search) },
                        { leave_reason: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    ]
                }
            }
            // @ts-ignore
            const leave = await Leave?.aggregatePaginate(Leave.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'employee',
                        foreignField: '_id',
                        as: 'employee'
                    }
                },
                { $unwind: {path: "$employee", preserveNullAndEmptyArrays: true }},
                {
                    $lookup: {
                        from: 'leave_settings',
                        localField: 'leave',
                        foreignField: '_id',
                        as: 'leave'
                    }
                },
                { $unwind: {path: "$leave", preserveNullAndEmptyArrays: true }},
                {
                    $project: {
                        // name: { $concat: [{ $ifNull: [{ $concat: ["$employee.first_name", " "] }, ''] }, { $ifNull: [{ $concat: ["$employee.middle_name", " "] }, ''] }, { $ifNull: ["$employee.last_name", ''] }] },
                        leave: "$leave.title",
                        name: {$concat: ["$employee.firstName"," ","$employee.lastName"]},
                        type: "$leave.type",
                        days: "$leave_days",
                        from: "$start_date",
                        to: "$end_date",
                        leave_reason: { $ifNull: ["$leave_reason", " "]},
                        status: 1,
                        createdAt: 1,
                    }
                },
                { $match: filter },
                { $sort: { createdAt: -1 } }
            ]),{
                page: query.page || 1,
                limit: query.size || 10,
            });
            return res.status(200).json({
                error: false,
                data: leave
            });
        }

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}


// delete Leave
exports.delLeave = async (req, res) => {
    try {
        const { query } = req;

        await Leave.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}