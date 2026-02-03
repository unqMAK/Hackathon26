import mongoose, { Document, Schema } from 'mongoose';

export interface IEvaluationScore {
    rubricId: mongoose.Types.ObjectId;
    score: number;
}

export interface IEvaluation extends Document {
    teamId: mongoose.Types.ObjectId;
    judgeId: mongoose.Types.ObjectId;
    scores: IEvaluationScore[];
    totalScore: number;
    feedback: string;
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const EvaluationSchema: Schema = new Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: [true, 'Team ID is required']
    },
    judgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Judge ID is required']
    },
    scores: [{
        rubricId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Rubric',
            required: true
        },
        score: {
            type: Number,
            required: true,
            min: [0, 'Score cannot be negative']
        }
    }],
    totalScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    feedback: {
        type: String,
        trim: true,
        maxlength: [2000, 'Feedback cannot exceed 2000 characters']
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure one evaluation per judge per team
EvaluationSchema.index({ teamId: 1, judgeId: 1 }, { unique: true });

// Index for queries
EvaluationSchema.index({ teamId: 1 });
EvaluationSchema.index({ judgeId: 1 });
EvaluationSchema.index({ totalScore: -1 });

export default mongoose.model<IEvaluation>('Evaluation', EvaluationSchema);
