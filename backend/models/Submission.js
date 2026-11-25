const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problemId: {
      type: String,
      required: [true, 'Problem ID is required'],
      trim: true,
    },
    language: {
      type: String,
      required: [true, 'Programming language is required'],
      enum: ['cpp', 'c', 'java', 'python', 'javascript'],
    },
    code: {
      type: String,
      required: [true, 'Submitted code cannot be empty'],
    },
    status: {
      type: String,
      enum: ['Accepted', 'Wrong Answer', 'Compilation Error', 'Runtime Error'],
      default: 'Accepted',
    },
    executionTime: {
      type: String, // e.g., "42 ms"
      default: '0 ms',
    },
  },
  { timestamps: true } 
);

submissionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);