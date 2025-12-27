import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // e.g., 'CND Federal', 'CND Estadual', 'FGTS'
    issueDate: { type: Date },
    expiryDate: { type: Date, required: true },
    status: { type: String, enum: ['Válida', 'Vencida', 'A vencer'], default: 'Válida' },
    fileUrl: { type: String },
    autoRenewal: { type: Boolean, default: false }
}, { timestamps: true });

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
