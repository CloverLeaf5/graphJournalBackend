const express = require("express");
const authMiddleware = require("../middlewares/auth");
const {newGroup, getGroups} = require("../controllers/group");

const router = express.Router();

router.post("/group/newGroup", authMiddleware, newGroup);
router.get("/group/getGroups", authMiddleware, getGroups);

module.exports = router;