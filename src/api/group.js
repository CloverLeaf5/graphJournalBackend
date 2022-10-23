const express = require("express");
const authMiddleware = require("../middlewares/auth");
const {newGroup, getGroups, updateGroup, deleteGroup} = require("../controllers/group");

const router = express.Router();

router.post("/group/newGroup", authMiddleware, newGroup);
router.post("/group/updateGroup", authMiddleware, updateGroup);
router.post("/group/deleteGroup", authMiddleware, deleteGroup);
router.get("/group/getGroups", authMiddleware, getGroups);

module.exports = router;