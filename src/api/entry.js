const express = require("express");
const authMiddleware = require("../middlewares/auth");
const {newEntry, getEntryTypes,
    getEntryTypesWithText, updateAPIImage,
    getEntries, updateEntry, deleteEntry} = require("../controllers/entry");

const router = express.Router();

router.post("/entry/newEntry", authMiddleware, newEntry);
router.post("/entry/updateEntry", authMiddleware, updateEntry);
router.post("/entry/deleteEntry", authMiddleware, deleteEntry);
router.post("/entry/updateAPIImage", authMiddleware, updateAPIImage);
router.get("/entry/getEntries", authMiddleware, getEntries);
router.get("/entry/getEntryTypes", authMiddleware, getEntryTypes);
router.get("/entry/getEntryTypesWithText", authMiddleware, getEntryTypesWithText);

module.exports = router;