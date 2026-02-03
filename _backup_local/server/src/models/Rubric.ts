import mongoose, { Document, Schema } from 'mongoose';

export interface IRubric extends Document {
    title: string;
    description: string;
    maxScore: number;
    weight: number;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const RubricSchema: Schema = new Schema({
    title: {
        type: String,
        required: [true, 'Rubric title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    maxScore: {
        type: Number,
        required: true,
        default: 10,
        min: [1, 'Max score must be at least 1'],
        max: [100, 'Max score cannot exceed 100']
    },
    weight: {
        type: Number,
        required: true,
        min: [0, 'Weight must be between 0 and 1'],
        max: [1, 'Weight must be between 0 and 1']
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for sorting by order
RubricSchema.index({ order: 1 });
RubricSchema.index({ isActive: 1, order: 1 });

export default mongoose.model<IRubric>('Rubric', RubricSchema);
