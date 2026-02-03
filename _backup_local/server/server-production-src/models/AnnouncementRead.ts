import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncementRead extends Document {
    announcementId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    isRead: boolean;
    readAt?: Date;
}

const AnnouncementReadSchema: Schema = new Schema({
    announcementId: {
        type: Schema.Types.ObjectId,
        ref: 'Announcement',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Compound index for unique announcement-user pairs and efficient queries
AnnouncementReadSchema.index({ announcementId: 1, userId: 1 }, { unique: true });
AnnouncementReadSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model<IAnnouncementRead>('AnnouncementRead', AnnouncementReadSchema);
