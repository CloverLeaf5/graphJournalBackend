const express = require("express");
const authMiddleware = require("../middlewares/auth");
const {newTag} = require("../controllers/tag");

const router = express.Router();

router.post("/tag/newTag", authMiddleware, newTag);

module.exports = router;