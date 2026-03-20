const mongoose = require('mongoose');
const User = require('../models/user');
const Payment = require('../models/payment');
const Taxfile = require('../models/taxfile');
const { v4: uuidv4 } = require("uuid");
const { getOrderDetails } = require('../utils/paypal-api');
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Env_variables = require('../models/env_variable');
const { createMollieClient } = require('@mollie/api-client');



// stripe make payment
exports.paymentCheckout = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { product, token, progress_number, steps } = req.body;
        console.log(req.body)
        const envFileData = await Env_variables.findOne({});

        const stripe = require("stripe")(`${envFileData?.stripe_secret_key}`);


        // for 100% offer charge
        if (product?.price === 0 && !!token.card.address_zip) {
            await Payment.create(
                [
                    {
                        user: res.locals.user.id,
                        tax_file: product?.taxFileId,
                        amount: product?.price,
                        paid: true,
                    }
                ], { session })

            await Taxfile.updateOne({ _id: product?.taxFileId }, { $set: { stripe_payment: 'paid', progress_number, steps, postal_code: token.card.address_zip } }, { session })

            await User.updateOne({ _id: res.locals.user.id }, { $set: { steps: 3 } }, { session });

            await session.commitTransaction();

            return res.status(200).json({
                status: true,
                message: 'Payment successful'
            })
        }


        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id,
        });

        const idempotencyKey = uuidv4();

        const charge = await stripe.charges.create(
            {
                amount: Math.round(product?.price * 100),
                currency: `${product?.countryCurrency.toLowerCase()}`,
                customer: customer.id,
                receipt_email: token.email,
                description: `${product.name}`,
                shipping: {
                    name: token.card.name,
                    address: {
                        line1: token.card.address_line1,
                        line2: token.card.address_line2,
                        city: token.card.address_country,
                        postal_code: token.card.address_zip,
                    },
                },
            },
            {
                idempotencyKey
            }
        );

        if (charge?.paid === true) {
            await Payment.create(
                [
                    {
                        user: res.locals.user.id,
                        tax_file: product?.taxFileId,
                        amount: product?.price,
                        paid: true,
                        payment_method: "Stripe"
                    }
                ], { session })

            await Taxfile.updateOne({ _id: product?.taxFileId }, { $set: { stripe_payment: 'paid', progress_number, steps, postal_code: token.card.address_zip } }, { session })

            await User.updateOne({ _id: res.locals.user.id }, { $set: { steps: 3 } }, { session });
        }

        await session.commitTransaction();

        return res.status(200).json({
            status: true,
            message: 'Payment successful, thanks'
        })

    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            status: false,
            message: error.message
        })

    } finally {
        await session.endSession();
    }
}



//.......................
// paypal payment gateway
//.......................
exports.paypalVerify = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const { details, product, progress_number, steps, payment_method } = req.body;

    try {
        const paypalOrder = await getOrderDetails(details?.orderID)

        if ((paypalOrder?.status === 'COMPLETED') && (details?.orderID === paypalOrder?.id)) {
            await Payment.create(
                [{
                    user: res.locals.user.id,
                    tax_file: product?.taxFileId,
                    amount: product?.price,
                    paid: true,
                    payment_method
                }],
                { session }
            )

            await Taxfile.updateOne(
                { _id: product?.taxFileId },
                { $set: { stripe_payment: 'paid', progress_number, steps, postal_code: paypalOrder?.purchase_units[0].shipping?.address?.postal_code } },
                { session }
            )

            await User.updateOne({ _id: res.locals.user.id }, { $set: { steps: 3 } }, { session });

            await session.commitTransaction();

            return res.status(200).json({
                status: true,
                message: 'Payment successful, thanks'
            })

        } else {
            await session.abortTransaction();
            return res.status(400).json({
                status: false,
                message: 'Order failed! Please contact with support'
            })
        }

    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            status: false,
            message: error.message
        })

    } finally {
        await session.endSession();
    }
};


//.......................
//.......................
// mollie payment gateway
//.......................
//.......................
exports.molliePaymentGetaway = async (req, res, next) => {
    const orderId = uuidv4();
    const url = `${req.protocol}://${req.get('host')}/`;
    const setAmount = `${parseFloat(Number(req.body.price)).toFixed(2)}`;

    try {
        const envFileData = await Env_variables.findOne({});

        const mollieClient = createMollieClient({ apiKey: envFileData?.mollie_live_api_key });

        const payment = await mollieClient.payments.create({
            amount: { value: setAmount, currency: 'EUR' },
            description: req.body.name,
            redirectUrl: `${url}api/payment/webhook?id=${orderId}`,
            metadata: { orderId },
        });

        // Redirect the consumer to complete the payment using `payment.getPaymentUrl()`.
        // save info into the database
        await Payment.create(
            {
                user: res.locals.user.id,
                tax_file: req.body?.taxFileId,
                amount: req.body?.price,
                paid: false,
                payment
            }
        )

        return res.send(payment.getPaymentUrl());

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: false,
            message: error
        })
    }

}


// mollie payment check
exports.molliePaymentCheck = async (req, res, next) => {

    try {
        // fetch data from orderId
        const findPayment = await Payment.findOne({ "payment.metadata.orderId": req.query.id })
        if (!findPayment) return res.status(400).json({ status: false, message: "Sorry! Payment Failed..." });

        const envFileData = await Env_variables.findOne({});

        const mollieClient = createMollieClient({ apiKey: envFileData?.mollie_live_api_key });

        // check payment by id
        const payment = await mollieClient.payments.get(findPayment.payment.id);

        if (payment.isPaid()) {
            // Hooray, you've received a payment! You can start shipping to the consumer.
            await Payment.updateOne(
                { _id: findPayment?._id },
                {
                    $set: { paid: true, payment_method: 'Mollie' },
                }
            )

            await Taxfile.updateOne(
                { _id: findPayment?.tax_file },
                { $set: { stripe_payment: 'paid', progress_number: 50, steps: 3 } }
            )

            await User.updateOne({ _id: findPayment?.user }, { $set: { steps: 3 } });

            return res.status(200).json({
                status: true,
                message: 'Payment Successful, thanks',
            });

        } else if (!payment.isOpen()) {
            // The payment isn't paid and has expired. We can assume it was aborted.
            return res.status(400).json({
                status: false,
                message: 'Payment time out or canceled!',
            });
        }

        return res.status(400).json({
            status: false,
            message: 'Payment Failed',
            payment
        });


    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}



//.......................
//.......................
// razorPay payment gateway
//.......................
//.......................
exports.razorPayOrder = async (req, res) => {
    try {
        const envFileData = await Env_variables.findOne({});


        const instance = new Razorpay({
            key_id: envFileData?.razorpay_client_id,
            key_secret: envFileData?.razorpay_secret_key,
        });

        const options = {
            amount: parseInt(req.body.amount * 100),
            currency: req.body?.currency,
            receipt: crypto.randomBytes(10).toString("hex"),
        };

        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "Something Went Wrong!" });
            }

            return res.status(200).json({ data: order });
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error!" });
    }
}


exports.razorVerification = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const { response, product } = req.body;

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body.response;

        const envFileData = await Env_variables.findOne({});

        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSign = crypto
            .createHmac("sha256", envFileData?.razorpay_secret_key)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            await Payment.create(
                [{
                    user: res.locals.user.id,
                    tax_file: product?.taxFileId,
                    amount: product?.price,
                    paid: true,
                    payment_method: "Razorpay"
                }],
                { session }
            )

            await Taxfile.updateOne(
                { _id: product?.taxFileId },
                { $set: { stripe_payment: 'paid', progress_number: 50, steps: 3 } },
                { session }
            )

            await User.updateOne({ _id: res.locals.user.id }, { $set: { steps: 3 } }, { session });

            await session.commitTransaction();

            return res.status(200).json({ status: true, message: "Payment successfully, thanks" });

        } else {
            await session.abortTransaction();
            return res.status(400).json({ status: false, message: "Invalid signature sent!" });
        }

    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({ message: "Internal Server Error!" });

    } finally {
        await session.endSession();
    }
}



// call api for verify payment
exports.verifyPayment = async (req, res, next) => {
    try {
        const payment_verify = await Payment.findOne({ tax_file: mongoose.Types.ObjectId(req.query.taxfileID) })

        if (!payment_verify) return res.status(404).json({ status: false, message: 'Payment Info Not Found!' })

        return res.status(200).json({ status: true, data: payment_verify })

    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error!" });
    }
}