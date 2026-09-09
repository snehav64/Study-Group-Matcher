const express = require('express');
const { proposeSession, listSessionsForGroup, mySessions, rsvpSession } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
router.post('/', protect, proposeSession);
router.get('/mine', protect, mySessions);
router.get('/group/:groupId', protect, listSessionsForGroup);
router.patch('/:id/rsvp', protect, rsvpSession);
module.exports = router;
