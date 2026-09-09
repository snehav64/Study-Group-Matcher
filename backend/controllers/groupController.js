const Group = require('../models/Group');

const createGroup = async (req, res, next) => {
  try {
    const { name, subject, description, maxMembers, tags, meetingLink } = req.body;
    if (!name || !subject) return res.status(400).json({ message: 'Name and subject are required' });

    const group = await Group.create({
      name, subject, description, maxMembers, tags, meetingLink,
      createdBy: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
};

const listGroups = async (req, res, next) => {
  try {
    const { subject, tag } = req.query;
    const filter = {};
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (tag) filter.tags = tag;
    const groups = await Group.find(filter).populate('createdBy', 'name').sort('-createdAt');
    res.json(groups);
  } catch (err) {
    next(err);
  }
};

const myGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user._id }).populate('createdBy', 'name');
    res.json(groups);
  } catch (err) {
    next(err);
  }
};

const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email university')
      .populate('createdBy', 'name');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) {
    next(err);
  }
};

const updateGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (String(group.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the group creator can edit this group' });
    }
    const { name, description, maxMembers, tags, meetingLink } = req.body;
    if (name !== undefined) group.name = name;
    if (description !== undefined) group.description = description;
    if (maxMembers !== undefined) group.maxMembers = maxMembers;
    if (tags !== undefined) group.tags = tags;
    if (meetingLink !== undefined) group.meetingLink = meetingLink;
    const updated = await group.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const leaveGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    group.members = group.members.filter((m) => String(m) !== String(req.user._id));
    await group.save();
    res.json({ message: 'Left group' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createGroup, listGroups, myGroups, getGroup, updateGroup, leaveGroup };
