const express = require("express");
const {
    getSubmissions,
    getSubmissionById,
    deleteSubmission
} = require("../controllers/submissionController");
const router = express.Router();

// Get all submissions
router.get("/", getSubmissions);

// Get a particular submission
router.get("/:id", getSubmissionById);

// Delete a submission
router.delete("/:id", deleteSubmission);

module.exports = router;