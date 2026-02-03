import mongoose, { Document, Schema } from 'mongoose';

export interface IInstitute extends Document {
    name: string;
    code: string;
    isActive: boolean;
    createdAt: Date;
}

const InstituteSchema: Schema = new Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.model<IInstitute>('Institute', InstituteSchema);
