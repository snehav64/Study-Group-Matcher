const express = require('express');
const { sendRequest, listRequestsForGroup, respondToRequest } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
router.post('/:groupId', protect, sendRequest);
router.get('/group/:groupId', protect, listRequestsForGroup);
router.patch('/:id', protect, respondToRequest);
module.exports = router;
