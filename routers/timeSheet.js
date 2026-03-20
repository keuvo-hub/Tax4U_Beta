const { Router } = require('express')
const timeSheetRoutes = Router();
const {
    getTimeSheet
} = require('../controllers/timeSheet');
const { userAuth } = require('../auth');

// get
timeSheetRoutes.get('/', getTimeSheet);

// module exports
module.exports = timeSheetRoutes;