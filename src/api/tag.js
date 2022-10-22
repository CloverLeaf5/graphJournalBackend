const express = require("express");
const authMiddleware = require("../middlewares/auth");
const {newTag, getTags} = require("../controllers/tag");

const router = express.Router();

router.post("/tag/newTag", authMiddleware, newTag);
router.get("/tag/getTags", authMiddleware, getTags);

module.exports = router;