const FriendRequest = require('../models/FriendRequest');

const sendFriendRequest = async (req, res, next) => {
  try {
    const toUserId = req.params.userId;
    if (String(toUserId) === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot send a request to yourself' });
    }
    const reverse = await FriendRequest.findOne({ from: toUserId, to: req.user._id });
    if (reverse) {
      if (reverse.status !== 'accepted') {
        reverse.status = 'accepted';
        await reverse.save();
      }
      return res.json(reverse);
    }
    const existing = await FriendRequest.findOne({ from: req.user._id, to: toUserId });
    if (existing) return res.status(400).json({ message: `Request already ${existing.status}` });

    const request = await FriendRequest.create({ from: req.user._id, to: toUserId });
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
};

const listPendingRequests = async (req, res, next) => {
  try {
    const requests = await FriendRequest.find({ to: req.user._id, status: 'pending' }).populate('from', 'name email university');
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

const respondToFriendRequest = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ message: 'Status must be accepted or rejected' });
    const request = await FriendRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (String(request.to) !== String(req.user._id)) return res.status(403).json({ message: 'Not authorized to respond to this request' });
    request.status = status;
    await request.save();
    res.json(request);
  } catch (err) {
    next(err);
  }
};

const listFriends = async (req, res, next) => {
  try {
    const requests = await FriendRequest.find({
      status: 'accepted',
      $or: [{ from: req.user._id }, { to: req.user._id }],
    }).populate('from', 'name email university').populate('to', 'name email university');

    const friends = requests.map((r) => (String(r.from._id) === String(req.user._id) ? r.to : r.from));
    res.json(friends);
  } catch (err) {
    next(err);
  }
};

module.exports = { sendFriendRequest, listPendingRequests, respondToFriendRequest, listFriends };
