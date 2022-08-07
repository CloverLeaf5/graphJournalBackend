const express = require("express");
const passport = require("passport");

const router = express.Router();

// EVENTUALLY UPDATE THESE TO ROUTE TO FRONTEND
const successLoginUrl = "http://localhost:5000/api/v1/login/success";
const errorLoginUrl = "http://localhost:5000/api/v1/login/error";

router.get(
    "/login/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureMessage: "Cannot login to Google, please try again later!",
        failureRedirect: errorLoginUrl,
        successRedirect: successLoginUrl
    }),
    (req, res) => {
        console.log("User: ", req.user);
        res.send("Thank you for signing in!");
    }
);

module.exports = router;