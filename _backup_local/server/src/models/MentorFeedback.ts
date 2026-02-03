import mongoose, { Document, Schema } from 'mongoose';

export interface IMentorFeedback extends Document {
    teamId: mongoose.Types.ObjectId;
    mentorId: mongoose.Types.ObjectId;
    phase: 'ideation' | 'prototype' | 'development' | 'final';
    status: 'pending' | 'approved' | 'changes-required';
    feedback: string;
    attachments?: string[];
    replies: Array<{
        userId: mongoose.Types.ObjectId;
        message: string;
        createdAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const MentorFeedbackSchema: Schema = new Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    phase: {
        type: String,
        enum: ['ideation', 'prototype', 'development', 'final'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'changes-required'],
        default: 'pending'
    },
    feedback: {
        type: String,
        required: true
    },
    attachments: [{ type: String }],
    replies: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for efficient queries
MentorFeedbackSchema.index({ teamId: 1, mentorId: 1 });
MentorFeedbackSchema.index({ teamId: 1, phase: 1 });

export default mongoose.model<IMentorFeedback>('MentorFeedback', MentorFeedbackSchema);
