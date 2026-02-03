import mongoose, { Document, Schema } from 'mongoose';

export interface ICountdown extends Document {
    title: string;
    targetDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CountdownSchema: Schema = new Schema({
    title: {
        type: String,
        required: true,
        default: 'Event Starts In'
    },
    targetDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model<ICountdown>('Countdown', CountdownSchema);
