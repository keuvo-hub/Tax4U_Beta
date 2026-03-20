const { Router } = require('express')
const leaveRoutes = Router();
const {
    postLeave, getLeave, delLeave
} = require('../controllers/leave');
const { userAuth } = require('../auth');

// post 
leaveRoutes.post('/', userAuth({isAdmin: true}), postLeave);
// get
leaveRoutes.get('/', getLeave);
// delete
leaveRoutes.delete('/', userAuth({isAdmin: true}), delLeave);

// module exports
module.exports = leaveRoutes;