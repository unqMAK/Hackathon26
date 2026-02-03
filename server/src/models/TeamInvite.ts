import mongoose, { Document, Schema } from 'mongoose';

export interface ITeamInvite extends Document {
    toUserId: mongoose.Types.ObjectId;
    fromUserId: mongoose.Types.ObjectId;
    teamId: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    instituteId: string; // For validation
    respondedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const TeamInviteSchema: Schema = new Schema({
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    instituteId: { type: String, required: true },
    respondedAt: { type: Date }
}, {
    timestamps: true
});

// Index for faster queries
TeamInviteSchema.index({ toUserId: 1, status: 1 });
TeamInviteSchema.index({ teamId: 1, status: 1 });

export default mongoose.model<ITeamInvite>('TeamInvite', TeamInviteSchema);
