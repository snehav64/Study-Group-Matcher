const express = require('express');
const { sendFriendRequest, listPendingRequests, respondToFriendRequest, listFriends } = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/', protect, listFriends);
router.get('/pending', protect, listPendingRequests);
router.post('/:userId', protect, sendFriendRequest);
router.patch('/:id', protect, respondToFriendRequest);
module.exports = router;
