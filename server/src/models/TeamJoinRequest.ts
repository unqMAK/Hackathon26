import mongoose, { Document, Schema } from 'mongoose';

export interface ITeamJoinRequest extends Document {
    toTeamId: mongoose.Types.ObjectId;
    fromUserId: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const TeamJoinRequestSchema: Schema = new Schema({
    toTeamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Index for faster queries
TeamJoinRequestSchema.index({ toTeamId: 1, status: 1 });
TeamJoinRequestSchema.index({ fromUserId: 1, status: 1 });

export default mongoose.model<ITeamJoinRequest>('TeamJoinRequest', TeamJoinRequestSchema);
