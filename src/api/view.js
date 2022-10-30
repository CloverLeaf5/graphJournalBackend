const express = require("express");
const authMiddleware = require("../middlewares/auth");
const { findEntries, saveView, getSavedViews } = require("../controllers/view");

const router = express.Router();

router.post("/view/findEntries", authMiddleware, findEntries);
router.post("/view/saveView", authMiddleware, saveView);
router.get("/view/getSavedViews", authMiddleware, getSavedViews);

module.exports = router;