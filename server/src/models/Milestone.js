import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  serialNumber: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    index: true
  },
  topic: {
    type: String,
    required: true
  },
  targetDate: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true
  },
  completed: {
    type: Boolean,
    default: false,
    index: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  remarks: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export const Milestone = mongoose.model('Milestone', milestoneSchema);
