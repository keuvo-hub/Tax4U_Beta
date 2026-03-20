const { Router } = require('express')
const roleRoutes = Router();
const { protect } = require('../middleware/authProtect');
const {
    postRole, getRoles, getRole, deleteRole, getPermissions, postPermissions,
    departmentWiseList
} = require('../controllers/role.js');
const { userAuth } = require('../auth');

roleRoutes.post('/', postRole)
roleRoutes.get('/list', getRoles)
roleRoutes.get('/department-wise-list', protect, departmentWiseList)
roleRoutes.get('/', getRole)
roleRoutes.delete('/', deleteRole)
roleRoutes.post('/permissions', userAuth({isAdmin: true}), postPermissions)
roleRoutes.get('/permissions',  getPermissions)

// module exports
module.exports = roleRoutes;