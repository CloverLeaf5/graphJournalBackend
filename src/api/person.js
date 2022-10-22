const express = require("express");
const authMiddleware = require("../middlewares/auth");
const {newPerson, getPeople} = require("../controllers/person");

const router = express.Router();

router.post("/person/newPerson", authMiddleware, newPerson);
router.get("/person/getPeople", authMiddleware, getPeople);

module.exports = router;