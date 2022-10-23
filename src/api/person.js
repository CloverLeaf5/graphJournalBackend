const express = require("express");
const authMiddleware = require("../middlewares/auth");
const {newPerson, getPeople, deletePerson, updatePerson} = require("../controllers/person");

const router = express.Router();

router.post("/person/newPerson", authMiddleware, newPerson);
router.post("/person/deletePerson", authMiddleware, deletePerson);
router.post("/person/updatePerson", authMiddleware, updatePerson);
router.get("/person/getPeople", authMiddleware, getPeople);

module.exports = router;