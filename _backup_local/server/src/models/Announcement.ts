import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'urgent' | 'general';
    audience: 'all' | 'institute' | 'team';
    targetInstituteId?: string;
    targetTeamId?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const AnnouncementSchema: Schema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'urgent', 'general'],
        default: 'general'
    },
    audience: {
        type: String,
        enum: ['all', 'institute', 'team'],
        default: 'all'
    },
    targetInstituteId: {
        type: String,
        default: null
    },
    targetTeamId: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient querying
AnnouncementSchema.index({ audience: 1, createdAt: -1 });
AnnouncementSchema.index({ targetInstituteId: 1, createdAt: -1 });
AnnouncementSchema.index({ targetTeamId: 1, createdAt: -1 });

export default mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
