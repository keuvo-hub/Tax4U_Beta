const express = require("express");
const router = express.Router();
const {
    createEnv_variables, getOneEnv_variables, updateEnv_variables, deleteEnv_variables, publiclyAccessible
} = require('../controllers/env_variables');
const { protect } = require('../middleware/authProtect');

// post 
router.post('/create', protect, createEnv_variables);
// get
router.get('/get-one', protect, getOneEnv_variables);
router.get('/public', publiclyAccessible);
// put 
router.put('/update', protect, updateEnv_variables);
// delete
router.delete('/delete', protect, deleteEnv_variables);

// module exports
module.exports = router;