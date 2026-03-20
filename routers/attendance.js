const { Router } = require('express')
const attendanceRoutes = Router();
const {
   postAttendanceSetting, getAttendanceSetting, delAttendanceSetting,
   postAttendance, getAttendance, delAttendance, getEmployeePlusLastPunch,
   getEmployeePunchInOut, clockIn, clockOut, getOneClockInOut, breakTimeStart
} = require('../controllers/attendance')
const { protect } = require('../middleware/authProtect');
const { userAuth } = require('../auth');

// attendance setting
attendanceRoutes.post('/setting', protect, postAttendanceSetting);
attendanceRoutes.get('/setting', getAttendanceSetting);
attendanceRoutes.delete('/setting', protect, delAttendanceSetting);

// attendance
attendanceRoutes.post('/', protect, postAttendance);
attendanceRoutes.get('/', getAttendance);
attendanceRoutes.get('/employee-punch', getEmployeePlusLastPunch);
attendanceRoutes.get('/punch-in-out', getEmployeePunchInOut);
attendanceRoutes.delete('/', protect, delAttendance);

// clock in-out
attendanceRoutes.get('/clock-in', protect, clockIn);
attendanceRoutes.get('/clock-out', protect, clockOut);
attendanceRoutes.get('/clock-in-out', getOneClockInOut);

// break-time
attendanceRoutes.get('/break-time-start', breakTimeStart);


// module exports
module.exports = attendanceRoutes;