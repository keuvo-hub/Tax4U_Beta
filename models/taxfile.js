const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')

// schema design
const studentTaxFileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    step_one_info: [],
    step_two_info: [],
    first_name: {
        type: String,
        minlength: 1,
        maxlength: 200,
        trim: true,
        lowercase: true,
    },
    middle_name: {
        type: String,
        minlength: 1,
        maxlength: 200,
        trim: true
    },
    last_name: {
        type: String,
        minlength: 1,
        maxlength: 200,
        lowercase: true,
        trim: true
    },
    ID: {
        type: String,
        unique: true,
        min: 1,
    },
    year: {
        type: String,
        trim: true
    },
    phone_number: {
        type: String,
        minlength: 5,
        maxlength: 100,
        trim: true
    },
    taxfile_status: {
        type: String,
        enum: ['active', 'pending', 'block', 'unconfirmed', 'banned', 'completed', 'rejected'],
        default: 'unconfirmed'
    },
    taxfile_status_admin: {
        type: String,
        enum: ['New File', 'Submitted to Accountant', 'Taxes Filed', 'TAXES FILED COMPLETELY'],
        default: 'New File'
    },
    profile_image: {
        type: String,
        trim: true
    },
    t2202a_form: {
        type: String,
        trim: true
    },
    province_name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Province',
    },
    college_university_attending: {
        type: Boolean,
    },
    first_time_tax: {
        type: Boolean,
    },
    institution_name: {
        type: String,
        trim: true
    },
    ca_land_year: {
        type: String,
        trim: true
    },
    date_of_birth: {
        type: String,
        trim: true
    },
    social_insurance_no: {
        type: Number,
        min: 0
    },
    address: {
        type: String,
        trim: true,
        minlength: 0,
        maxlength: 500
    },
    marital_status: {
        type: String,
        trim: true,
        minlength: 0,
        maxlength: 100
    },
    partner_first_name: {
        type: String,
        minlength: 1,
        maxlength: 200,
        trim: true
    },
    partner_last_name: {
        type: String,
        minlength: 1,
        maxlength: 200,
        trim: true
    },
    partner_dob: {
        type: String,
        trim: true
    },
    partner_sin: {
        type: String,
        trim: true
    },
    digital_signature: {
        type: String,
        minlength: 1,
        trim: true
    },
    direct_deposit_form: {
        type: String,
        minlength: 1,
        trim: true
    },
    drivers_license: {
        type: String,
        minlength: 1,
        maxlength: 200,
        trim: true
    },
    income_in_cad_dollar: {
        type: Number,
        min: 0,
        trim: true
    },
    income_prior_to_coming_to_canada: {
        type: Boolean,
    },
    is_uber_driver: {
        type: Boolean,
    },
    t4s: {
        type: Array
    },
    this_year_jobs: {
        type: Number,
        min: 0,
    },
    uber_summary_pic: {
        type: String,
        minlength: 0,
        trim: true
    },
    form_fill_up: {
        type: String,
        enum: ['pending', 'done'],
        default: 'pending'
    },
    stripe_payment: {
        type: String,
        enum: ['pending', 'unconfirmed', 'paid'],
        default: 'pending'
    },
    assigned_accountant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    terms_and_conditions: {
        type: Boolean
    },
    mark_as_read: {
        type: Boolean,
        default: false
    },
    file_from_accountant: {
        type: String,
        trim: true
    },
    progress_number: {
        type: Number,
        default: 15,
    },
    steps: {
        type: Number,
        default: 0
    },
    taken_a_review: {
        type: Boolean,
        default: false
    },
    taken_review_count: {
        type: Number,
        default: 0
    },
    time_to_call_1: {
        type: String,
        trim: true
    },
    time_to_call_2: {
        type: String,
        trim: true
    },
    notice_of_assessment: {
        type: String,
        trim: true
    },
    postal_code: {
        type: String,
        trim: true
    },
    case_context: {
        status: { type: String, default: "inactive" },
        language: { type: String, default: null },
        workflow_trigger: { type: String, default: null },
        last_state_update_at: { type: Date, default: null },
        warnings: { type: Array, default: [] },
        next_best_action: { type: String, default: null },
        user_summary: { type: String, default: null },
        admin_summary: { type: String, default: null },
        ready_for_agent: { type: Boolean, default: false },
        assigned_preparer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        assigned_preparer_name: { type: String, default: null },
        appointment: { type: Object, default: null },
        payment_status: { type: String, default: null },
        document_context: {
            checklist: { type: Array, default: [] },
            documents_detected: { type: Array, default: [] },
            missing_documents: { type: Array, default: [] },
            documents_table: { type: Array, default: [] }
        },
        clone1_memory: {
            last_summary: { type: String, default: null },
            last_intent: { type: String, default: null },
            updated_at: { type: Date, default: null }
        }
    },
    step3_ai: {
        enabled: {
            type: Boolean,
            default: false
        },
        trigger_source: {
            type: String,
            enum: ["save_next_step3", "admin_force_review", "case_reopened"],
            default: "save_next_step3"
        },
        status: {
            type: String,
            enum: ["inactive", "step3_triggered", "reviewing_uploads", "waiting_documents", "documents_irregular", "missing_documents", "documents_complete", "ready_for_agent", "agent_assigned", "ready_for_step4", "closed"],
            default: "inactive"
        },
        irregularities_detected: {
            type: Array,
            default: []
        },
        checklist: {
            type: Array,
            default: []
        },
        documents_detected: {
            type: Array,
            default: []
        },
        missing_documents: {
            type: Array,
            default: []
        },
        reminders_sent: {
            type: Array,
            default: []
        },
        last_client_message: {
            type: String,
            default: null
        },
        last_analysis_at: {
            type: Date,
            default: null
        },
        ready_for_agent: {
            type: Boolean,
            default: false
        },
        assigned_agent_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        assigned_agent_name: {
            type: String,
            default: null
        },
        case_summary: {
            type: String,
            default: null
        },
        documents_table: {
            type: Array,
            default: []
        },
        step4_allowed: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});
studentTaxFileSchema.plugin(paginate)
studentTaxFileSchema.plugin(aggregatePaginate)
const Taxfile = mongoose.model("Taxfile", studentTaxFileSchema);
module.exports = Taxfile;
