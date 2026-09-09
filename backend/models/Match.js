const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    matchedGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    score: { type: Number, required: true },
    breakdown: {
      subjectScore: { type: Number, default: 0 },
      availabilityScore: { type: Number, default: 0 },
      skillLevelScore: { type: Number, default: 0 },
      preferenceScore: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', matchSchema);
