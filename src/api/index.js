const express = require("express");
const testAPI = require("./test");
const loginWithGoogleApi = require("./loginWithGoogle");
const entryAPI = require("./entry");
const userAPI = require("./user");
const tagAPI = require("./tag");
const personAPI = require("./person");
const groupAPI = require("./group");

const router = express.Router();

router.use(testAPI);
router.use(loginWithGoogleApi);
router.use(entryAPI);
router.use(userAPI);
router.use(tagAPI);
router.use(personAPI);
router.use(groupAPI);


module.exports = router;