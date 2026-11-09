const mongoose = require("mongoose");
const submissionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        problemId: {
            type: String,
            default: null
        },

        language: {
            type: String,
            required: true,
            enum: ["javascript", "python", "java", "cpp", "c"]
        },

        sourceCode: {
            type: String,
            required: true
        },

        customInput: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: [
                "Pending",
                "Accepted",
                "Wrong Answer",
                "Compilation Error",
                "Runtime Error",
                "Execution Error"
            ],
            default: "Pending"
        },

        output: {
            type: String,
            default: ""
        },

        error: {
            type: String,
            default: ""
        },

        executionTime: {
            type: Number,
            default: null
        }
    },
    {
        timestamps: true
    }
);

submissionSchema.index({ userId: 1, createdAt: -1 });
module.exports = mongoose.model("Submission", submissionSchema);