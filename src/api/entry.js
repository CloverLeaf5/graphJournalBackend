const express = require("express");
const authMiddleware = require("../middlewares/auth");
const {newEntry, getEntryTypes,
    getEntryTypesWithText, updateAPIImage} = require("../controllers/entry");

const router = express.Router();

router.post("/entry/newEntry", authMiddleware, newEntry);
router.post("/entry/updateAPIImage", authMiddleware, updateAPIImage);
router.get("/entry/getEntryTypes", authMiddleware, getEntryTypes);
router.get("/entry/getEntryTypesWithText", authMiddleware, getEntryTypesWithText);

module.exports = router;