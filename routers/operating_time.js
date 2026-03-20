const { Router } = require('express')
const operatingTimeRoutes = Router();
const {
    postOperatingTime, getOperatingTimes, delOperatingTime
} = require('../controllers/operating_time');
const { userAuth } = require('../auth');
 
operatingTimeRoutes.post('/', userAuth({isAdmin: true}), postOperatingTime);
operatingTimeRoutes.get('/', getOperatingTimes);
operatingTimeRoutes.delete('/', userAuth({isAdmin: true}), delOperatingTime);

// module exports
module.exports = operatingTimeRoutes;