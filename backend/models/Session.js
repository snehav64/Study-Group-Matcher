const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    proposedTime: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    location: { type: String, trim: true },
    link: { type: String, trim: true },
    attendees: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rsvp: { type: String, enum: ['yes', 'no', 'maybe', 'pending'], default: 'pending' },
      },
    ],
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
