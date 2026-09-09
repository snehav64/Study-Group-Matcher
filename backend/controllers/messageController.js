const Message = require('../models/Message');
const Group = require('../models/Group');

const listMessages = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.some((m) => String(m) === String(req.user._id))) {
      return res.status(403).json({ message: 'Only group members can view chat history' });
    }
    const messages = await Message.find({ group: req.params.groupId }).populate('sender', 'name').sort('createdAt').limit(200);
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

module.exports = { listMessages };
