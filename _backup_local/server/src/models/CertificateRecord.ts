import mongoose, { Document, Schema } from 'mongoose';

export interface ICertificateRecord extends Document {
    userId: mongoose.Types.ObjectId;
    teamId?: mongoose.Types.ObjectId;
    category: 'participation' | 'winner' | 'runner-up' | 'jury' | 'mentor' | 'spoc' | 'custom';
    pdfUrl: string;
    issuedAt: Date;
}

const certificateRecordSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    category: {
        type: String,
        enum: ['participation', 'winner', 'runner-up', 'jury', 'mentor', 'spoc', 'custom'],
        required: true
    },
    pdfUrl: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for faster lookups by user
certificateRecordSchema.index({ userId: 1 });
certificateRecordSchema.index({ teamId: 1 });

export default mongoose.model<ICertificateRecord>('CertificateRecord', certificateRecordSchema);
