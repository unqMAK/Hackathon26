import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'team' | 'system';
    recipientType: 'all' | 'students' | 'spocs' | 'mentors' | 'judges' | 'admins' | 'custom';
    recipients: mongoose.Types.ObjectId[]; // For direct user notifications
    instituteId?: string; // For institute-wide notifications
    triggeredBy: mongoose.Types.ObjectId;
    relatedTeamId?: mongoose.Types.ObjectId;
    relatedInviteId?: mongoose.Types.ObjectId;
    relatedJoinRequestId?: mongoose.Types.ObjectId;
    relatedSubmissionId?: mongoose.Types.ObjectId;
    relatedAnnouncementId?: mongoose.Types.ObjectId;
    isReadBy: mongoose.Types.ObjectId[]; // Users who have read this notification
    isActive: boolean;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'team', 'system', 'team_invite', 'team_join_request', 'team_invite_accepted', 'team_invite_rejected', 'team_join_accepted', 'team_join_rejected'],
        default: 'info'
    },
    recipientType: {
        type: String,
        enum: ['all', 'students', 'spocs', 'mentors', 'judges', 'admins', 'custom'],
        required: true
    },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    instituteId: { type: String },
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    relatedTeamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    relatedInviteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamInvite' },
    relatedJoinRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamJoinRequest' },
    relatedSubmissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
    relatedAnnouncementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Announcement' },
    isReadBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Index for faster queries
NotificationSchema.index({ recipients: 1, createdAt: -1 });
NotificationSchema.index({ recipientType: 1, createdAt: -1 });
NotificationSchema.index({ instituteId: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
