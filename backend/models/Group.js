const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 500 },
    maxMembers: { type: Number, default: 6, min: 2, max: 30 },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String, trim: true }],
    meetingLink: { type: String, trim: true },
  },
  { timestamps: true }
);

groupSchema.virtual('isFull').get(function () {
  return this.members.length >= this.maxMembers;
});
groupSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Group', groupSchema);
