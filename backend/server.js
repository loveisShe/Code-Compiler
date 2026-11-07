const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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