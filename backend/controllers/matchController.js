const User = require('../models/User');
const Group = require('../models/Group');
const Match = require('../models/Match');
const { computeUserMatch, computeGroupMatch } = require('../utils/matchEngine');

const getMatches = async (req, res, next) => {
  try {
    const me = req.user;

    const candidateUsers = await User.find({ _id: { $ne: me._id } });
    const userMatches = candidateUsers
      .map((candidate) => {
        const { score, breakdown } = computeUserMatch(me, candidate);
        return {
          user: {
            _id: candidate._id,
            name: candidate.name,
            university: candidate.university,
            courses: candidate.courses,
            studyPreference: candidate.studyPreference,
          },
          score,
          breakdown,
        };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    const candidateGroups = await Group.find({ members: { $ne: me._id } }).populate(
      'members',
      'courses availability studyPreference name'
    );
    const groupMatches = candidateGroups
      .map((group) => {
        const { score, breakdown } = computeGroupMatch(me, group);
        return {
          group: {
            _id: group._id,
            name: group.name,
            subject: group.subject,
            tags: group.tags,
            memberCount: group.members.length,
            maxMembers: group.maxMembers,
          },
          score,
          breakdown,
        };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    const toStore = [
      ...userMatches.slice(0, 5).map((m) => ({ user: me._id, matchedUser: m.user._id, score: m.score, breakdown: m.breakdown })),
      ...groupMatches.slice(0, 5).map((m) => ({ user: me._id, matchedGroup: m.group._id, score: m.score, breakdown: m.breakdown })),
    ];
    if (toStore.length) await Match.insertMany(toStore);

    res.json({ userMatches, groupMatches });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMatches };
