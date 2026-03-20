const {Router} = require('express');
const {userAuth} = require('../auth');
const {
    postPayrollSalarySetting,
    getPayrollSalarySettings,
    delPayrollSalarySetting,
    postPayrollAdvanceSalary,
    getPayrollAdvanceSalaries,
    delPayrollAdvanceSalary,
    getSalaryElements,
    postSalary,
    getSalaryList,
    delEmployeeSalary
} = require('../controllers/payroll');

const payrollRoutes = Router();
// employee salary
payrollRoutes.post('/salary', userAuth({isAdmin: true}), postSalary);
payrollRoutes.get('/salary-list', userAuth({isAdmin: true}), getSalaryList);
payrollRoutes.get('/salary-elements', getSalaryElements);
payrollRoutes.delete('/salary', userAuth({isAdmin: true}), delEmployeeSalary);

payrollRoutes.post('/salary-setting', userAuth({isAdmin: true}), postPayrollSalarySetting);
payrollRoutes.get('/salary-setting', getPayrollSalarySettings);
payrollRoutes.delete('/salary-setting', userAuth({isAdmin: true}), delPayrollSalarySetting);

payrollRoutes.post('/advance-salary', userAuth({isAdmin: true}), postPayrollAdvanceSalary);
payrollRoutes.get('/advance-salary', getPayrollAdvanceSalaries);
payrollRoutes.delete('/advance-salary', userAuth({isAdmin: true}), delPayrollAdvanceSalary);


// module exports
module.exports = payrollRoutes;