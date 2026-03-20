const { Router } = require('express')
const holidayRoutes = Router();
const {
    postHoliday, getHoliday, delHoliday
} = require('../controllers/holiday');
const { userAuth } = require('../auth');

// post 
holidayRoutes.post('/', userAuth({isAdmin: true}), postHoliday);
// get
holidayRoutes.get('/', getHoliday);
// delete
holidayRoutes.delete('/', userAuth({isAdmin: true}), delHoliday);

// module exports
module.exports = holidayRoutes;