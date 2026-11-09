const express = require("express");

const {
    getSubmissions,
    getSubmissionById,
    deleteSubmission
} = require("../controllers/submissionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all submission routes
router.use(protect);

// GET all submissions
router.get("/", getSubmissions);

// GET a particular submission
router.get("/:id", getSubmissionById);

// DELETE a submission
router.delete("/:id", deleteSubmission);

module.exports = router;