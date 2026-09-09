const fs = require('fs');
const path = require('path');
const Resource = require('../models/Resource');
const Group = require('../models/Group');

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]+/i;

const assertMember = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) {
    const err = new Error('Group not found');
    err.status = 404;
    throw err;
  }
  if (!group.members.some((m) => String(m) === String(userId))) {
    const err = new Error('Only group members can access resources');
    err.status = 403;
    throw err;
  }
  return group;
};

// @route POST /api/resources/:groupId/upload  (multipart/form-data, field name "file")
const uploadFile = async (req, res, next) => {
  try {
    await assertMember(req.params.groupId, req.user._id);
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const resource = await Resource.create({
      group: req.params.groupId,
      uploadedBy: req.user._id,
      type: 'file',
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
    });

    res.status(201).json(resource);
  } catch (err) {
    // clean up the orphaned file on disk if DB save failed after multer already wrote it
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// @route POST /api/resources/:groupId/link  { title, url }
const addYoutubeLink = async (req, res, next) => {
  try {
    await assertMember(req.params.groupId, req.user._id);
    const { title, url } = req.body;
    if (!url || !YOUTUBE_REGEX.test(url.trim())) {
      return res.status(400).json({ message: 'Please provide a valid YouTube link' });
    }

    const resource = await Resource.create({
      group: req.params.groupId,
      uploadedBy: req.user._id,
      type: 'youtube',
      title: title?.trim() || 'YouTube video',
      url: url.trim(),
    });

    res.status(201).json(resource);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// @route GET /api/resources/group/:groupId
const listResources = async (req, res, next) => {
  try {
    await assertMember(req.params.groupId, req.user._id);
    const resources = await Resource.find({ group: req.params.groupId })
      .populate('uploadedBy', 'name')
      .sort('-createdAt');
    res.json(resources);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// @route DELETE /api/resources/:id
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (String(resource.uploadedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the uploader can delete this resource' });
    }
    if (resource.type === 'file' && resource.storedName) {
      const filePath = path.join(__dirname, '..', 'uploads', resource.storedName);
      fs.unlink(filePath, () => {});
    }
    await resource.deleteOne();
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadFile, addYoutubeLink, listResources, deleteResource };
