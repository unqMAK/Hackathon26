import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmissionFile {
    url: string;
    filename?: string;
    size?: number;
    provider?: 's3' | 'local' | 'url';
}

export interface ISubmission extends Document {
    teamId: mongoose.Types.ObjectId;
    submittedBy: mongoose.Types.ObjectId;
    files: ISubmissionFile[];
    repoUrl?: string;
    notes?: string;
    version: number;
    status: 'submitted' | 'updated' | 'locked';
    isFinal: boolean;
    feedback?: string;
    score?: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SubmissionFileSchema = new Schema({
    url: { type: String, required: true },
    filename: { type: String },
    size: { type: Number },
    provider: { type: String, enum: ['s3', 'local', 'url'], default: 'url' }
}, { _id: false });

const SubmissionSchema: Schema = new Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    files: [SubmissionFileSchema],
    repoUrl: {
        type: String,
        validate: {
            validator: function (v: string) {
                if (!v) return true;
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Invalid URL format'
        }
    },
    notes: { type: String, maxlength: 2000 },
    version: { type: Number, default: 1 },
    status: {
        type: String,
        enum: ['submitted', 'updated', 'locked'],
        default: 'submitted'
    },
    isFinal: { type: Boolean, default: false },
    feedback: { type: String },
    score: { type: Number, min: 0, max: 100 },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Indexes for efficient queries
SubmissionSchema.index({ teamId: 1, version: -1 });
SubmissionSchema.index({ status: 1 });
SubmissionSchema.index({ createdAt: -1 });

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);
