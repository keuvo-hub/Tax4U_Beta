// import external modules
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv')
const cors = require('cors');
const morgan = require("morgan");
const multer = require("multer");
const helmet = require('helmet');
const compression = require('compression')
const fs = require('fs');
const app = express();

// middleware
dotenv.config();
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://tax.eduardoservices4u.com",
    "http://localhost:3000",
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(cors({
  origin: [
    "https://tax.eduardoservices4u.com",
    "http://localhost:3000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
}));

app.options("*", cors({
  origin: [
    "https://tax.eduardoservices4u.com",
    "http://localhost:3000"
  ],
  credentials: true
}));
app.use(compression())
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({extended: true}));
app.use(helmet())

const isEnvExist = fs.existsSync('./.env');

// check environment file
if (isEnvExist === false) {
    const {createAdminAndEnv} = require('./controllers/admin');

    app.get('/', (req, res, next) => {
        return res.status(200).json({
            status: true,
            env: false
        })
    })

    app.post('/setting', createAdminAndEnv)

    // server listening
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server is listening on port : ${port}`))

} else if (isEnvExist === true) {

    const http = require('http').Server(app);
    const io = require('socket.io')(http, {
        cors: {
            origin: '*',
        }
    });

app.set('io', io);
    io.on('connection', socket => {
    console.log('SOCKET CONNECTED BACKEND:', socket.id);

    socket.emit('tawk:test', {
        ok: true,
        socketId: socket.id,
        createdAt: new Date().toISOString()
    });

    socket.emit('tawk:outbound-message', {
        chatId: 'debug123',
        message: 'debug outbound direct from connection',
        createdAt: new Date().toISOString()
    });
});

    app.use(function (req, res, next) {
        res.locals.socket = io
        next()
    });

    // import internal modules
    const users = require('./routers/users');
    const taxFilePrices = require('./routers/taxfile_prices');
    const couponCodes = require('./routers/coupon_codes');
    const provinces = require('./routers/provinces');
    const studentFormFields = require('./routers/student_form_fields');
    const permissions = require('./routers/permissions');
    const faqs = require('./routers/faqs');
    const studentTaxFiles = require('./routers/taxfiles');
    const paymentGateway = require('./routers/paymentGateway');
    const frontPage = require('./routers/frontPage');
    const feedbacks = require('./routers/feedbacks');
    const contactUs = require('./routers/contact_us');
    const filesUpload = require('./routers/files');
    const site_settings = require('./routers/site_setting');
    const site_contents_about = require('./routers/site_contents_about');
    const site_service_blogs = require('./routers/service_blogs');
    const user_roles = require('./routers/user_roles');
    const userFormControllers = require('./routers/userFormControllers');
    const pdfExcelData = require('./routers/pdf_excel_data');
    const taxSituation = require('./routers/tax_situations');
    const paymentMethodOption = require('./routers/payment_methods');
    const envVariables = require('./routers/env_variables');
    const payment = require('./routers/payment');
    const roleRoutes = require("./routers/role");
    const operatingTimeRoutes = require("./routers/operating_time");
    const leaveRoutes = require("./routers/leave");
    const leaveSettingsRoutes = require("./routers/leave_setting");
    const holidayRoutes = require("./routers/holiday");
    const attendanceRoutes = require("./routers/attendance");
    const departmentRoutes = require("./routers/department");
    const timeSheetRoutes = require("./routers/timeSheet");
    const payrollRoutes = require("./routers/payroll");
    const ticket = require("./routers/ticket");
    const marketingRoutes = require("./routers/marketing");
    const pageRoutes = require("./routers/page");
const tawkWebhookRoutes = require('./src/routes/tawkWebhook.routes');
const tawkOutboundRoutes = require('./src/routes/tawkOutbound.routes');
const conversationalHubRoutes = require('./src/routes/conversationalHub.routes');

    // morgan routes view
    if (app.get("env") === "development") {
        app.use(morgan("tiny"));
        console.log("Morgan connected..");
    }

    // Database connection
    const db = `${process.env.DB_STRING}`;
    mongoose.connect(db)
        .then(() => console.log('Database connected successfully'))
        .catch((err) => console.log(err.message))

    // routes
    app.use('/api/user', users);
    app.use('/api/taxfile_price', taxFilePrices);
    app.use('/api/coupon_code', couponCodes);
    app.use('/api/province', provinces);
    app.use('/api/student_form_fields', studentFormFields);
    app.use('/api/permissions', permissions);
    app.use('/api/faqs', faqs);
    app.use('/api/taxfiles', studentTaxFiles);
    app.use('/api/payment', paymentGateway);
    app.use('/api/frontPage', frontPage);
    app.use('/api/feedbacks', feedbacks);
    app.use('/api/contacts', contactUs);
    app.use('/api/files', filesUpload);
    app.use('/api/site_settings', site_settings);
    app.use('/api/site_contents_about', site_contents_about);
    app.use('/api/site_service_blogs', site_service_blogs);
    app.use('/api/user_roles', user_roles);
    app.use('/api/user_form_controller', userFormControllers);
    app.use('/api/pdf_excel_data', pdfExcelData);
    app.use('/api/tax_situation', taxSituation);
    app.use('/api/payment_method_option', paymentMethodOption);
    app.use('/api/env_variables', envVariables);
    app.use('/api/user/payment/', payment);
    app.use('/api/role', roleRoutes);
    app.use('/api/operating-time', operatingTimeRoutes);
    app.use('/api/leave', leaveRoutes);
    app.use('/api/leave-setting', leaveSettingsRoutes);
    app.use('/api/holiday', holidayRoutes);
    app.use('/api/attendance', attendanceRoutes);
    app.use('/api/department', departmentRoutes);
    app.use('/api/timeSheet', timeSheetRoutes);
    app.use('/api/payroll', payrollRoutes);
    app.use('/api/ticket', ticket);
    app.use('/api/marketing', marketingRoutes);
    app.use('/api/page', pageRoutes);
app.use('/', tawkWebhookRoutes);
app.use('/', tawkOutboundRoutes);
app.use('/api/conversational-hub', conversationalHubRoutes);

    // server welcome response
    app.get('/', (req, res, next) => {
        return res.status(200).json({
            status: true,
            message: `Welcome to server side`,
        })
    })

    // multer error handler
    app.use((error, req, res, next) => {
        if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    message: "file is too large",
                });
            }
            if (error.code === "LIMIT_FILE_COUNT") {
                return res.status(400).json({
                    message: "File limit reached",
                });
            }
            if (error.code === "LIMIT_UNEXPECTED_FILE") {
                return res.status(400).json({
                    message: "File must be an image/pdf/csv",
                });
            }
        }
    });

    const cron = require('node-cron');
    const {cornEmail} = require("./utils/marketing/emailCron");
    const {cornSms} = require("./utils/marketing/smsCron");
    const {cornWhatsapp} = require("./utils/marketing/whatsappCron")

    //run every 5 sec
    cron.schedule('*/5 * * * *', () => {
        cornEmail();
        cornSms()
        cornWhatsapp()
    });

    // server listening
    const port = process.env.PORT || 5000;
    http.listen(port, () => console.log(`Server is listening on port : ${port}`))
}
