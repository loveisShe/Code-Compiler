const Submission = require('../models/Submission');

const createSubmission = async (req, res, next) => {
  try {
    const { problemId, language, code, status } = req.body;

    if (!problemId || !language || !code || !code.trim()) {
      return res.status(400).json({ message: 'Problem ID, language, and code are required' });
    }

    const allowedStatuses = ['Accepted', 'Wrong Answer', 'Compilation Error', 'Runtime Error'];
    const finalStatus = allowedStatuses.includes(status) ? status : 'Accepted';

    const submission = await Submission.create({
      user: req.user._id, // Attached by authMiddleware
      problemId,
      language: language.toLowerCase(),
      code,
      status: finalStatus,
    });

    res.status(201).json({
      message: 'Code submitted successfully',
      submission,
    });
  } catch (error) {
    next(error);
  }
};
const getUserSubmissions = async (req, res, next) => {
  try {
    const { problemId, status, language, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };
    if (problemId) query.problemId = problemId;
    if (status) query.status = status;
    if (language) query.language = language.toLowerCase();

    const skip = (Number(page) - 1) * Number(limit);

    const [submissions, total] = await Promise.all([
      Submission.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 }) // Latest submission first
        .skip(skip)
        .limit(Number(limit)),
      Submission.countDocuments(query),
    ]);

    res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      submissions,
    });
  } catch (error) {
    next(error);
  }
};

const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('user', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }

    res.status(200).json(submission);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubmission,
  getUserSubmissions,
  getSubmissionById,
};