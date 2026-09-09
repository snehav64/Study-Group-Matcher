const WEIGHTS = { subject: 0.4, availability: 0.3, skill: 0.2, preference: 0.1 };
const SKILL_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };

function subjectOverlapScore(coursesA, coursesB) {
  if (!coursesA.length || !coursesB.length) return 0;
  const subjectsA = new Set(coursesA.map((c) => c.subject.toLowerCase()));
  const subjectsB = new Set(coursesB.map((c) => c.subject.toLowerCase()));
  const intersection = [...subjectsA].filter((s) => subjectsB.has(s));
  const union = new Set([...subjectsA, ...subjectsB]);
  return union.size === 0 ? 0 : (intersection.length / union.size) * 100;
}

function timeRangesOverlap(slotA, slotB) {
  if (slotA.day !== slotB.day) return 0;
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const overlapStart = Math.max(toMinutes(slotA.startTime), toMinutes(slotB.startTime));
  const overlapEnd = Math.min(toMinutes(slotA.endTime), toMinutes(slotB.endTime));
  return Math.max(0, overlapEnd - overlapStart);
}

function availabilityOverlapScore(availA, availB) {
  if (!availA.length || !availB.length) return 0;
  let totalOverlapMinutes = 0;
  for (const slotA of availA) {
    for (const slotB of availB) {
      totalOverlapMinutes += timeRangesOverlap(slotA, slotB);
    }
  }
  const cappedMinutes = Math.min(totalOverlapMinutes, 300);
  return (cappedMinutes / 300) * 100;
}

function skillClosenessScore(coursesA, coursesB) {
  if (!coursesA.length || !coursesB.length) return 0;
  const subjectsB = new Map(coursesB.map((c) => [c.subject.toLowerCase(), c.skillLevel]));
  const sharedDiffs = [];
  for (const courseA of coursesA) {
    const key = courseA.subject.toLowerCase();
    if (subjectsB.has(key)) {
      const diff = Math.abs(SKILL_ORDER[courseA.skillLevel] - SKILL_ORDER[subjectsB.get(key)]);
      sharedDiffs.push(diff);
    }
  }
  if (!sharedDiffs.length) return 0;
  const avgDiff = sharedDiffs.reduce((a, b) => a + b, 0) / sharedDiffs.length;
  return Math.max(0, 100 - avgDiff * 50);
}

function preferenceScore(prefA, prefB) {
  if (prefA === prefB) return 100;
  if (prefA === 'mixed' || prefB === 'mixed') return 60;
  return 20;
}

function computeUserMatch(userA, userB) {
  const subjectScore = subjectOverlapScore(userA.courses, userB.courses);
  const availabilityScore = availabilityOverlapScore(userA.availability, userB.availability);
  const skillScore = skillClosenessScore(userA.courses, userB.courses);
  const prefScore = preferenceScore(userA.studyPreference, userB.studyPreference);

  const score =
    subjectScore * WEIGHTS.subject +
    availabilityScore * WEIGHTS.availability +
    skillScore * WEIGHTS.skill +
    prefScore * WEIGHTS.preference;

  return {
    score: Math.round(score),
    breakdown: {
      subjectScore: Math.round(subjectScore),
      availabilityScore: Math.round(availabilityScore),
      skillLevelScore: Math.round(skillScore),
      preferenceScore: Math.round(prefScore),
    },
  };
}

function computeGroupMatch(user, group) {
  if (!group.members || group.members.length === 0) {
    return { score: 0, breakdown: { subjectScore: 0, availabilityScore: 0, skillLevelScore: 0, preferenceScore: 0 } };
  }
  const results = group.members
    .filter((m) => String(m._id) !== String(user._id))
    .map((member) => computeUserMatch(user, member));

  if (!results.length) {
    return { score: 0, breakdown: { subjectScore: 0, availabilityScore: 0, skillLevelScore: 0, preferenceScore: 0 } };
  }

  const avg = (key) => Math.round(results.reduce((sum, r) => sum + r.breakdown[key], 0) / results.length);
  const breakdown = {
    subjectScore: avg('subjectScore'),
    availabilityScore: avg('availabilityScore'),
    skillLevelScore: avg('skillLevelScore'),
    preferenceScore: avg('preferenceScore'),
  };
  const score = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);

  return { score, breakdown };
}

module.exports = { computeUserMatch, computeGroupMatch };
