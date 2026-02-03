import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
    name: string;
    leaderId: mongoose.Types.ObjectId; // Team leader
    members: mongoose.Types.ObjectId[]; // User IDs (Approved members)
    problemId?: mongoose.Types.ObjectId;
    status: 'pending' | 'approved' | 'rejected';
    instituteId: string; // Legacy/Display name
    instituteCode: string;
    instituteName: string;
    mentorName: string;
    mentorEmail: string;
    spocName: string;
    spocEmail: string;
    spocDistrict?: string;
    spocState?: string;
    spocId?: mongoose.Types.ObjectId;
    mentorId?: mongoose.Types.ObjectId;
    consentFile: string; // URL
    pendingMembers: {
        name: string;
        email: string;
    }[];
    progress: number;
    phases?: {
        ideation: 'pending' | 'approved' | 'changes-required';
        prototype: 'pending' | 'approved' | 'changes-required';
        development: 'pending' | 'approved' | 'changes-required';
        final: 'pending' | 'approved' | 'changes-required';
    };
    spocNotes?: string; // Feedback
    rejectionReason?: string;
    approvedBy?: mongoose.Types.ObjectId; // Admin who approved
    approvedAt?: Date;
    rejectedAt?: Date;
    requestSent: boolean;
    requestedAt?: Date;
}

const TeamSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', default: null },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    instituteId: { type: String },
    instituteCode: { type: String, required: true },
    instituteName: { type: String, required: true },
    mentorName: { type: String, required: true },
    mentorEmail: { type: String, required: true },
    spocName: { type: String, required: true },
    spocEmail: { type: String, required: true },
    spocDistrict: { type: String },
    spocState: { type: String },
    spocId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    consentFile: { type: String, required: true },
    pendingMembers: [{
        name: { type: String, required: true },
        email: { type: String, required: true }
    }],
    progress: { type: Number, default: 0 },
    phases: {
        ideation: { type: String, enum: ['pending', 'approved', 'changes-required'], default: 'pending' },
        prototype: { type: String, enum: ['pending', 'approved', 'changes-required'], default: 'pending' },
        development: { type: String, enum: ['pending', 'approved', 'changes-required'], default: 'pending' },
        final: { type: String, enum: ['pending', 'approved', 'changes-required'], default: 'pending' }
    },
    spocNotes: { type: String },
    rejectionReason: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    requestSent: { type: Boolean, default: false },
    requestedAt: { type: Date }
}, {
    timestamps: true
});

export default mongoose.model<ITeam>('Team', TeamSchema);
