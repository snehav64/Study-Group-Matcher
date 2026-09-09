const JoinRequest = require('../models/JoinRequest');
const Group = require('../models/Group');

const sendRequest = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.members.some((m) => String(m) === String(req.user._id))) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }
    if (group.members.length >= group.maxMembers) return res.status(400).json({ message: 'Group is full' });

    const existing = await JoinRequest.findOne({ group: group._id, user: req.user._id });
    if (existing) return res.status(400).json({ message: `Request already ${existing.status}` });

    const request = await JoinRequest.create({ group: group._id, user: req.user._id, message: req.body.message });
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
};

const listRequestsForGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (String(group.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the group creator can view requests' });
    }
    const requests = await JoinRequest.find({ group: group._id, status: 'pending' }).populate('user', 'name email university courses');
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

const respondToRequest = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    const request = await JoinRequest.findById(req.params.id).populate('group');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (String(request.group.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the group creator can respond to requests' });
    }
    request.status = status;
    await request.save();

    if (status === 'approved') {
      const group = await Group.findById(request.group._id);
      if (group.members.length >= group.maxMembers) return res.status(400).json({ message: 'Group is now full' });
      if (!group.members.some((m) => String(m) === String(request.user))) {
        group.members.push(request.user);
        await group.save();
      }
    }
    res.json(request);
  } catch (err) {
    next(err);
  }
};

module.exports = { sendRequest, listRequestsForGroup, respondToRequest };
