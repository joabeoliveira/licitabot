import mongoose from 'mongoose';

const tenderSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    openingDate: { type: Date },
    estimatedValue: { type: Number },
    status: { type: String, enum: ['Aberto', 'Análise', 'Concluído', 'Suspenso', 'Futuro'], default: 'Aberto' },
    source: { type: String, enum: ['PNCP', 'Compras.gov.br', 'Outros'] },
    externalId: { type: String },
    keywords: [String],
    region: { type: String },
    organ: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

tenderSchema.index({ user: 1, externalId: 1 }, { unique: true });

const Tender = mongoose.model('Tender', tenderSchema);

export default Tender;
