const { Router } = require('express')
const { userAuth } = require('../auth');
const {
    postDepartment, departmentList, getDepartmentElements, getDepartment, delDepartment,
    getDepartmentWiseSubDepartmentList
} = require("../controllers/department")

const departmentRoutes = Router()
departmentRoutes.get('/list', departmentList)
departmentRoutes.get('/elements', getDepartmentElements)
departmentRoutes.get('/sub-department-list', getDepartmentWiseSubDepartmentList)
departmentRoutes.get('/', getDepartment)
departmentRoutes.post('/', postDepartment)
departmentRoutes.delete('/', delDepartment)

// module exports
module.exports = departmentRoutes;