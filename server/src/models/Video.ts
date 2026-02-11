import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
    youtubeLink: string;
    title: string;
    representativeName: string;
    representativeDesignation: string;
    problemStatements: {
        problemId: string;
        problemTitle: string;
    }[];
    isActive: boolean;
    order: number;
}

const VideoSchema: Schema = new Schema({
    youtubeLink: { type: String, required: true },
    title: { type: String, required: true },
    representativeName: { type: String, default: '' },
    representativeDesignation: { type: String, default: '' },
    problemStatements: [{
        problemId: { type: String, required: true },
        problemTitle: { type: String, required: true }
    }],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, {
    timestamps: true
});

export default mongoose.model<IVideo>('Video', VideoSchema);
