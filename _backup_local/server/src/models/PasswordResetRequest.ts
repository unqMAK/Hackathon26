import mongoose, { Document, Schema } from 'mongoose';

export interface IPasswordResetRequest extends Document {
    userId: mongoose.Types.ObjectId;
    email: string;
    userName: string;
    userPhone?: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: Date;
    processedAt?: Date;
    processedBy?: mongoose.Types.ObjectId;
    rejectionReason?: string;
}

const PasswordResetRequestSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true },
    userName: { type: String, required: true },
    userPhone: { type: String },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<IPasswordResetRequest>('PasswordResetRequest', PasswordResetRequestSchema);
