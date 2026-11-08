const Submission = require("../models/Submission");
const mongoose = require("mongoose");

// GET all submissions of a user
const getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({
            userId: req.user.id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: submissions.length,
            submissions
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch submissions",
            error: error.message
        });
    }
};


// GET a single submission by ID
const getSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid submission ID"
            });
        }

        const submission = await Submission.findOne({
            _id: id,
            userId: req.user.id
        });

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        res.status(200).json({
            success: true,
            submission
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch submission",
            error: error.message
        });
    }
};


// DELETE a submission
const deleteSubmission = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid submission ID"
            });
        }

        const submission = await Submission.findOneAndDelete({
            _id: id,
            userId: req.user.id
        });

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Submission deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete submission",
            error: error.message
        });
    }
};


module.exports = {
    getSubmissions,
    getSubmissionById,
    deleteSubmission
};