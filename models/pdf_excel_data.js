const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

// schema design
const pdfExcelSchema = new mongoose.Schema({
    user_role: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    pdf_excel_fields: []
}, {
    timestamps: true
});

pdfExcelSchema.plugin(paginate)
const Pdf_excel_data = mongoose.model("Pdf_excel_data", pdfExcelSchema);

module.exports = Pdf_excel_data;
