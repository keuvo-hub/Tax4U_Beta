const mongoose = require("mongoose");

// schema design
const adminPermissionSchema = new mongoose.Schema({
    admin: {
        admin_admin: Boolean, 
        admin_student: Boolean, 
        admin_accountant: Boolean
    },
    student: {
        student_admin: Boolean, 
        student_student: Boolean, 
        student_accountant: Boolean
    },
    accountant: {
        accountant_admin: Boolean, 
        accountant_student: Boolean, 
        accountant_accountant: Boolean
    }
}, {
    timestamps: true
});

const Permission = mongoose.model("Permission", adminPermissionSchema);

module.exports = Permission;
