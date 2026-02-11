import mongoose, { Document, Schema } from 'mongoose';

export interface IFAQ extends Document {
    question: string;
    answer: string;
    section: string;
    order: number;
    isActive: boolean;
}

const FAQSchema: Schema = new Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    section: { type: String, required: true, default: 'General' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

FAQSchema.index({ section: 1, order: 1 });

export default mongoose.model<IFAQ>('FAQ', FAQSchema);
