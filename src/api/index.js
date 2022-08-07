const express = require("express");
const testAPI = require("./test");
const loginWithGoogleApi = require("./loginWithGoogle");
const entryAPI = require("./entry");

const router = express.Router();

router.use(testAPI);
router.use(loginWithGoogleApi);
router.use(entryAPI);

module.exports = router;