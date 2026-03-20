const Payment = require('../models/payment');

exports.paymentHistories = async (req, res, next) => {
    try {
        const { query } = req;
        
        const paymentList = await Payment.paginate({
            paid: true
        }, {
            page: query.page || 1,
            limit: query.size || 5,
            sort: { createdAt: -1 },
            populate: [
                { path: 'user', select: 'username email' },
                { path: 'tax_file', select: 'ID' },
            ],
        });

        if(paymentList?.docs?.length === 0) return res.status(404).json({status: false, message: 'Not found'});

        return res.status(200).json({
            status: true,
            error: false,
            message: "All Payment records",
            data: paymentList
        })
        
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
}