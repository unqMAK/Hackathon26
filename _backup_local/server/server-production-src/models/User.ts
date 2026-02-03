import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'admin' | 'spoc' | 'student' | 'judge' | 'mentor';
    instituteId?: string;
    instituteName?: string;
    instituteCode?: string;
    district?: string;
    state?: string;
    teamId?: string;
    assignedTeams?: mongoose.Types.ObjectId[]; // For judges
    expertise?: string[]; // For mentors
    phone?: string; // For judges
    matchPassword: (enteredPassword: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'spoc', 'student', 'judge', 'mentor'],
        default: 'student'
    },
    instituteId: { type: String },
    instituteName: { type: String },
    instituteCode: { type: String },
    district: { type: String },
    state: { type: String },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    assignedTeams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
    expertise: [{ type: String }], // For mentors
    phone: { type: String } // For judges
}, {
    timestamps: true
});

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
});

export default mongoose.model<IUser>('User', UserSchema);
