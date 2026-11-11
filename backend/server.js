const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRouts = require("./src/routes/authRoutes");

const submissionRoutes = require("./routes/submissionRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth" , authRouts);
app.use("/api/submission", submissionRoutes);

// Test Route
app.get("/", (req, res) => {
    res.send("online code compiler backend is running!");
});

// Start server
const startServer = async () => {
    await connectDB();

    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on Port ${process.env.PORT || 5000}`);
    });
};

startServer();