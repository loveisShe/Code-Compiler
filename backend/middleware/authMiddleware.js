const express = require("express");
const router = express.Router();

const { signup , login , getme , forgotPassword , resetPassword } = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

router.post("/signup" , signup);
router.post("/login" , login);
router.get("/getme" , protect , getme);
router.post("/forgot-password" , forgotPassword);
router.post("/reset-password" , resetPassword);

module.exports = router;