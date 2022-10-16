const express = require("express");
const authMiddleware = require("../middlewares/auth");
const {newEntry} = require("../controllers/entry");

const router = express.Router();

router.post("/entry/newEntry", authMiddleware, newEntry);

module.exports = router;