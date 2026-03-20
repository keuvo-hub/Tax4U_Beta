const { Router } = require('express')
const leaveSettingsRoutes = Router();
const {
    postLeaveSetting, getLeaveSetting, delLeaveSetting
} = require('../controllers/leave_setting')
const { userAuth } = require('../auth');

// post 
leaveSettingsRoutes.post('/', userAuth({isAdmin: true}), postLeaveSetting);
// get
leaveSettingsRoutes.get('/', getLeaveSetting);
// delete
leaveSettingsRoutes.delete('/', userAuth({isAdmin: true}), delLeaveSetting);

// module exports
module.exports = leaveSettingsRoutes;