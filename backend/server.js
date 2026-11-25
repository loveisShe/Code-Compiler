const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const submissionRoutes = require("./routes/submissionRoutes");

dotenv.config();

const app = express();

// CORS 

const allowedOrigins = (
    process.env.FRONTEND_URL || "http://localhost:5173"
).split(",").map(origin => origin.trim());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// API Routes
app.use("/api/authc", authRoutes);
app.use("/api/submission", submissionRoutes);

// Health API
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Online Code Compiler Backend is running!"
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.message);

    res.status(err.message === "Not allowed by CORS" ? 403 : 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

// Start Server
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on Port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
