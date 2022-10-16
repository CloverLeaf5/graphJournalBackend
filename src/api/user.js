const express = require("express");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.get("/auth/user", authMiddleware, (req, res) => {
    res.json(req.user);
});

module.exports = router;