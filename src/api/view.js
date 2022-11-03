const express = require("express");
const authMiddleware = require("../middlewares/auth");
const { findEntries, saveView, getSavedViews,
    updateView, deleteView, populateViewEntries } = require("../controllers/view");

const router = express.Router();

router.post("/view/findEntries", authMiddleware, findEntries);
router.post("/view/saveView", authMiddleware, saveView);
router.post("/view/updateView", authMiddleware, updateView);
router.post("/view/deleteView", authMiddleware, deleteView);
router.post("/view/populateViewEntries", authMiddleware, populateViewEntries);
router.get("/view/getSavedViews", authMiddleware, getSavedViews);

module.exports = router;