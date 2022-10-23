const express = require("express");
const authMiddleware = require("../middlewares/auth");
const {newTag, getTags, deleteTag, updateTag} = require("../controllers/tag");

const router = express.Router();

router.post("/tag/newTag", authMiddleware, newTag);
router.post("/tag/deleteTag", authMiddleware, deleteTag);
router.post("/tag/updateTag", authMiddleware, updateTag);
router.get("/tag/getTags", authMiddleware, getTags);

module.exports = router;