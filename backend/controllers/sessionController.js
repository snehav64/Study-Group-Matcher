const Session = require('../models/Session');
const Group = require('../models/Group');

const proposeSession = async (req, res, next) => {
  try {
    const { groupId, proposedTime, durationMinutes, location, link } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.some((m) => String(m) === String(req.user._id))) {
      return res.status(403).json({ message: 'Only group members can propose sessions' });
    }
    const session = await Session.create({
      group: groupId, proposedBy: req.user._id, proposedTime, durationMinutes, location, link,
      attendees: group.members.map((userId) => ({
        user: userId,
        rsvp: String(userId) === String(req.user._id) ? 'yes' : 'pending',
      })),
    });
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
};

const listSessionsForGroup = async (req, res, next) => {
  try {
    const sessions = await Session.find({ group: req.params.groupId })
      .populate('proposedBy', 'name')
      .populate('attendees.user', 'name')
      .sort('proposedTime');
    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

const mySessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ 'attendees.user': req.user._id }).populate('group', 'name subject').sort('proposedTime');
    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

const rsvpSession = async (req, res, next) => {
  try {
    const { rsvp } = req.body;
    if (!['yes', 'no', 'maybe'].includes(rsvp)) return res.status(400).json({ message: 'Invalid rsvp value' });
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const attendee = session.attendees.find((a) => String(a.user) === String(req.user._id));
    if (!attendee) return res.status(403).json({ message: 'Not an attendee of this session' });
    attendee.rsvp = rsvp;
    await session.save();
    res.json(session);
  } catch (err) {
    next(err);
  }
};

module.exports = { proposeSession, listSessionsForGroup, mySessions, rsvpSession };
