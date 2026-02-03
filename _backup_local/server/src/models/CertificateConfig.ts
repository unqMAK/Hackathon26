import mongoose, { Document, Schema } from 'mongoose';

export interface ICertificateConfig extends Document {
    title: string;
    subtitle?: string;
    eventName: string;
    description?: string;
    backgroundImage?: string;
    signature1?: {
        label: string;
        imageUrl: string;
    };
    signature2?: {
        label: string;
        imageUrl: string;
    };
    isPublished: boolean;
    updatedAt: Date;
}

const certificateConfigSchema = new Schema({
    title: { type: String, required: true, default: 'Certificate of Appreciation' },
    subtitle: { type: String, default: 'This certificate is proudly presented to' },
    eventName: { type: String, required: true, default: 'HackSphere 2025' },
    description: { type: String, default: 'For their outstanding performance and dedication.' },
    backgroundImage: { type: String }, // URL to image
    signature1: {
        label: { type: String, default: 'Organizer' },
        imageUrl: { type: String }
    },
    signature2: {
        label: { type: String, default: 'Director' },
        imageUrl: { type: String }
    },
    isPublished: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<ICertificateConfig>('CertificateConfig', certificateConfigSchema);
