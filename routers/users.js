const express = require("express");
const router = express.Router();
const { 
  signup, 
  login, 
  deleteUser, 
  verifyOTP, 
  passwordChange,
  sendUserPasswordResetEmail,
  passwordReset,
  varifyAccount,
  directLogin, passwordChangeByAdmin, delUser
} = require('../controllers/auth');

const { getAllUser, 
  getOneUser, 
  userInfoUpdate, 
  varifyUser, 
  filterUser,
  updateManyAction,
  getAllAccountant,
  getTotalCount,
  sendEmailToUser, employeeList, filteringEmployeeList, employeeCreate
} = require('../controllers/users');
 
const { protect } = require('../middleware/authProtect');
const { userAuth } = require('../auth');

// Auth APIs post all
router.post('/signup', signup);
router.post('/login', login);
router.post('/directLogin', directLogin);
router.post('/verifyOTP', verifyOTP)
router.post('/passwordChange', protect, passwordChange);
router.post('/passwordChangeByAdmin', protect, passwordChangeByAdmin);
router.post('/sendUserPasswordResetEmail', sendUserPasswordResetEmail);
router.post('/passwordReset', protect, passwordReset);
router.post('/send-email-to-user', sendEmailToUser)
// Users APIs
router.get('/get-all',protect, getAllUser);
router.get('/getAllAccountant', protect, getAllAccountant)
router.get('/get-one', getOneUser)
router.get('/filter_role', protect, filterUser);
router.get('/get-total-count', getTotalCount)
router.get('/verify', protect, varifyUser);
router.get('/verify-account', varifyAccount);
// put
router.put('/edit', protect, userInfoUpdate)
router.put('/update-many', updateManyAction)
// delete user
router.delete('/delete', protect, deleteUser);
router.delete('/', userAuth({isAdmin: true}), delUser);
// employee
router.post('/employee-create', userAuth({isAdmin: true}), employeeCreate);
router.get('/employee-list', employeeList);
router.get('/filtering-employees', filteringEmployeeList);

// module exports
module.exports = router;