const express = require("express");
const authMiddleware = require("../middlewares/auth");
const { findEntries, saveView } = require("../controllers/view");

const router = express.Router();

router.post("/view/findEntries", authMiddleware, findEntries);
router.post("/view/saveView", authMiddleware, saveView);

module.exports = router;