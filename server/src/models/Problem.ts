import mongoose, { Document, Schema } from 'mongoose';

export interface IProblem extends Document {
    title: string;
    description: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    tags: string[];
    type: 'Software' | 'Hardware' | 'Both';
}

const ProblemSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    tags: {
        type: [String],
        default: []
    },
    type: {
        type: String,
        enum: ['Software', 'Hardware', 'Both'],
        default: 'Both'
    }
}, {
    timestamps: true
});

export default mongoose.model<IProblem>('Problem', ProblemSchema);

