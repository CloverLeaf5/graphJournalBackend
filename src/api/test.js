const express = require("express");
const Test = require("../models/testModel");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.get("/login/success", (req, res) => {
    res.json({message: "Login success"});
});

router.get("/login/error", (req, res) => {
    res.json({message: "Login error"});
});

router.get("/test/:text", authMiddleware, (req, res) => {
    const msg = req.params.text;
    const test = new Test({
        text: msg
    })
    test.save();
    res.json({message: `Created new document with ${msg}`});
});

module.exports = router;