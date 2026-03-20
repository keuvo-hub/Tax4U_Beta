const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

// schema design
const studentFormFieldsSchema = new mongoose.Schema({
  field_name: {
    type: String,
    trim: true,
  },
  input_name: {
    type: String,
    trim: true,
    unique: true,
    minlength: 0,
    maxlength: 300,
    lowercase: true,
    required: [true, 'Form field name required']
  },
  input_type: {
    type: String,
    enum: ['file', 'boolean', 'text', 'number', 'textarea', 'image', 'date', 'time', 'select', 'radio_button', 'switch', 'digital_signature', 'checkbox'],
    trim: true,
    minlength: 0,
    maxlength: 300,
    lowercase: true,
    required: [true, 'Form field type required']
  },
  select_options: [
    {
      type: String,
    }
  ],
  link: {
    type: String,
    trim: true,
  },
  placeholder: {
    type: String,
    trim: true,
    minlength: 0,
    maxlength: 200,
  },
  field_required: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    required: [true, 'Form field status required']
  },
  user_role: {
    type: String,
    trim: true,
    lowercase: true,
    default: 'all'
  },
  step_name: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true
});

studentFormFieldsSchema.plugin(paginate)
const StudentFormField = mongoose.model("Student_form_field", studentFormFieldsSchema);

module.exports = StudentFormField;
