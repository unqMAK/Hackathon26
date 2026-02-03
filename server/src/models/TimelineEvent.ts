import mongoose, { Document, Schema } from 'mongoose';

export interface ITimelineEvent extends Document {
    title: string;
    date: string;
    time: string;
    description: string;
    status: 'completed' | 'active' | 'upcoming';
    order: number;
}

const timelineEventSchema = new Schema<ITimelineEvent>(
    {
        title: { type: String, required: true },
        date: { type: String, required: true },
        time: { type: String, required: true },
        description: { type: String, required: true },
        status: {
            type: String,
            enum: ['completed', 'active', 'upcoming'],
            default: 'upcoming'
        },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model<ITimelineEvent>('TimelineEvent', timelineEventSchema);
