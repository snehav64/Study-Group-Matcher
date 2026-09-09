const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['file', 'youtube'], required: true },

    // for type: 'file'
    originalName: { type: String, trim: true },
    storedName: { type: String, trim: true }, // filename on disk
    mimeType: { type: String, trim: true },
    fileSize: { type: Number },

    // for type: 'youtube'
    title: { type: String, trim: true },
    url: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
