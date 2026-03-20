const crud = [
    {
        name: 'Create',
        permission: 'create'
    },
    {
        name: 'Edit',
        permission: 'edit'
    },
    {
        name: 'Delete',
        permission: 'delete'
    },
    {
        name: 'Show',
        permission: 'show'
    }
]

const modules = [
    {
        name: 'Dashboard',
        permission: 'dashboard',
    },
    {
        name: 'Live Site',
        permission: 'live_site',
    },
    {
        name: 'Admin Tax Files',
        permission: 'taxfiles',
    },
    {
        name: 'User Form Fields',
        permission: 'user_form_fields',
    },
    {
        name: 'Users',
        permission: 'users',
    },
    {
        name: 'Province',
        permission: 'province',
    },
    {
        name: 'Coupon',
        permission: 'coupon',
    },
    {
        name: 'Role & Permission',
        permission: 'role_and_permission',
    },

    {
        name: 'HRM',
        permission: 'hrm',
    },
    {
        name: 'HRM All Employee',
        permission: 'hrm_all_employee',
        child: crud
    },
    {
        name: 'HRM Departments',
        permission: 'hrm_department',
        child: crud
    },
    {
        name: 'HRM Roles & Permissions',
        permission: 'hrm_role_permission',
        child: crud
    },
    {
        name: 'HRM Attendance',
        permission: 'hrm_attendance',
        child: crud
    },
    {
        name: 'HRM Attendance Settings',
        permission: 'hrm_attendance_settings',
        child: crud
    },
    {
        name: 'HRM Time Sheet',
        permission: 'hrm_time_sheet',
        child: crud
    },
    {
        name: 'HRM Holidays',
        permission: 'hrm_holidays',
        child: crud
    },
    {
        name: 'HRM Leaves',
        permission: 'hrm_leaves',
        child: crud
    },
    {
        name: 'HRM Leaves Setting',
        permission: 'hrm_leaves_setting',
        child: crud
    },


    {
        name: 'Payroll',
        permission: 'payroll',
    },
    {
        name: 'Payroll Employee Salary',
        permission: 'payroll_employee_salary',
        child: crud
    },
    {
        name: 'Payroll Advance Salary',
        permission: 'payroll_advance_salary',
        child: crud
    },
    {
        name: 'Payroll Salary Settings',
        permission: 'payroll_salary_settings',
        child: crud
    },


    {
        name: 'Marketing',
        permission: 'marketing',
    },
    {
        name: 'Employee Ticket',
        permission: 'employee_ticket',
    },
    {
        name: 'Support Ticket',
        permission: 'ticket',
    },
    {
        name: 'Website Settings',
        permission: 'website_setting',
    },
    {
        name: 'Need Help',
        permission: 'documentation',
    },
]

let permissions = modules?.map(m => {
    if (m.child) {
        return {
            ...m,
            child: m.child?.map(c => ({
                ...c,
                permission: `${m.permission}_${c.permission}`
            }))
        }
    }
    return m
})

module.exports =  permissions