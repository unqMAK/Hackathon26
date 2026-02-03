import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IPendingTeam extends Document {
    name: string;
    leaderName: string;
    leaderEmail: string;
    leaderPhone: string;
    leaderPassword: string; // Hashed at save
    instituteCode: string;
    instituteName: string;
    mentorName: string;
    mentorEmail: string;
    spocName: string;
    spocEmail: string;
    spocDistrict?: string;
    spocState?: string;
    consentFile: string;
    problemId?: mongoose.Types.ObjectId; // Selected problem statement
    pendingMembers: {
        name: string;
        email: string;
    }[];
    status: 'pending' | 'rejected';
    rejectionReason?: string;
}

const PendingTeamSchema: Schema = new Schema({
    name: { type: String, required: true },
    leaderName: { type: String, required: true },
    leaderEmail: { type: String, required: true },
    leaderPhone: { type: String, required: true },
    leaderPassword: { type: String, required: true },
    instituteCode: { type: String, required: true },
    instituteName: { type: String, required: true },
    mentorName: { type: String, required: true },
    mentorEmail: { type: String, required: true },
    spocName: { type: String, required: true },
    spocEmail: { type: String, required: true },
    spocDistrict: { type: String },
    spocState: { type: String },
    consentFile: { type: String, required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    pendingMembers: [{
        name: { type: String, required: true },
        email: { type: String, required: true }
    }],
    status: {
        type: String,
        enum: ['pending', 'rejected'],
        default: 'pending'
    },
    rejectionReason: { type: String }
}, {
    timestamps: true
});

// Hash password before saving to PendingTeam
PendingTeamSchema.pre('save', async function (this: IPendingTeam, next) {
    if (!this.isModified('leaderPassword')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.leaderPassword = await bcrypt.hash(this.leaderPassword, salt);
    next();
});

export default mongoose.model<IPendingTeam>('PendingTeam', PendingTeamSchema);
