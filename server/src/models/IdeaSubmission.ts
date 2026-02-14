import mongoose, { Document, Schema } from 'mongoose';

export interface IIdeaSubmission extends Document {
    teamId: mongoose.Types.ObjectId;
    problemId: mongoose.Types.ObjectId;
    youtubeVideoLink: string;
    documentPath: string;           // local temp path
    documentOriginalName: string;
    driveFileId?: string;           // Google Drive file ID (server-side only)
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: mongoose.Types.ObjectId;
    reviewNote?: string;
    reviewedAt?: Date;
    submittedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const IdeaSubmissionSchema: Schema = new Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    youtubeVideoLink: {
        type: String,
        required: true,
        validate: {
            validator: function (v: string) {
                return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(v);
            },
            message: 'Please provide a valid YouTube URL'
        }
    },
    documentPath: { type: String, required: true },
    documentOriginalName: { type: String, required: true },
    driveFileId: { type: String },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewNote: {
        type: String,
        maxlength: [1000, 'Review note cannot exceed 1000 characters']
    },
    reviewedAt: { type: Date },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// One submission per team
IdeaSubmissionSchema.index({ teamId: 1 }, { unique: true });
IdeaSubmissionSchema.index({ status: 1 });
IdeaSubmissionSchema.index({ problemId: 1 });

export default mongoose.model<IIdeaSubmission>('IdeaSubmission', IdeaSubmissionSchema);
