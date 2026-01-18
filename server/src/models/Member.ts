import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    gender: { type: String, enum: ['male', 'female'], required: true },
    dob: { type: String },
    isAlive: { type: Boolean, default: true },
    photoUrl: { type: String },
    phone: { type: String },
    location: { type: String },
    fatherId: { type: String },
    motherId: { type: String },
    spouseId: { type: String },
    branchId: { type: String, default: 'main' },
    notes: { type: String }
}, {
    timestamps: true
});

// Index for faster queries
memberSchema.index({ id: 1 });
memberSchema.index({ fatherId: 1 });
memberSchema.index({ motherId: 1 });
memberSchema.index({ spouseId: 1 });

export const Member = mongoose.model('Member', memberSchema);
