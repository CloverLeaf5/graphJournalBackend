const express = require("express");
const authMiddleware = require("../middlewares/auth");
const {findEntries} = require("../controllers/view");

const router = express.Router();

router.post("/view/findEntries", authMiddleware, findEntries);

module.exports = router;