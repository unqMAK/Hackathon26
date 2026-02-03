import mongoose, { Document, Schema } from 'mongoose';

export interface IProblemApplication extends Document {
    teamId: mongoose.Types.ObjectId;
    problemId: mongoose.Types.ObjectId;
    status: 'pending' | 'approved' | 'rejected';
    supportingLinks: string[];
    supportingFiles: string[];
    comments: string;
    submittedBy: mongoose.Types.ObjectId;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewNote?: string;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ProblemApplicationSchema: Schema = new Schema({
    teamId: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    supportingLinks: [{
        type: String,
        trim: true
    }],
    supportingFiles: [{
        type: String  // File URLs
    }],
    comments: {
        type: String,
        maxlength: [2000, 'Comments cannot exceed 2000 characters'],
        default: ''
    },
    submittedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewNote: {
        type: String,
        maxlength: [1000, 'Review note cannot exceed 1000 characters']
    },
    reviewedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound index: One application per team per problem
ProblemApplicationSchema.index({ teamId: 1, problemId: 1 }, { unique: true });

// Index for efficient querying
ProblemApplicationSchema.index({ status: 1, createdAt: -1 });
ProblemApplicationSchema.index({ teamId: 1, status: 1 });

export default mongoose.model<IProblemApplication>('ProblemApplication', ProblemApplicationSchema);
