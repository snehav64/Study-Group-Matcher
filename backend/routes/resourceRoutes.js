const express = require('express');
const { uploadFile, addYoutubeLink, listResources, deleteResource } = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/group/:groupId', protect, listResources);
router.post('/:groupId/upload', protect, upload.single('file'), uploadFile);
router.post('/:groupId/link', protect, addYoutubeLink);
router.delete('/:id', protect, deleteResource);

module.exports = router;
