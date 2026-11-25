const express = require('express');
const router = express.Router();
const {
  createSubmission,
  getUserSubmissions,
  getSubmissionById,
} = require('../controllers/submissionController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createSubmission);
router.get('/history', protect, getUserSubmissions);
router.get('/:id', protect, getSubmissionById);

module.exports = router;