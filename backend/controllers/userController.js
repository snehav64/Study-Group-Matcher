const User = require('../models/User');

const updateProfile = async (req, res, next) => {
  try {
    const { name, university, courses, availability, studyPreference, bio } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (university !== undefined) user.university = university;
    if (courses !== undefined) user.courses = courses;
    if (availability !== undefined) user.availability = availability;
    if (studyPreference !== undefined) user.studyPreference = studyPreference;
    if (bio !== undefined) user.bio = bio;

    const updated = await user.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { updateProfile, getUserById };
