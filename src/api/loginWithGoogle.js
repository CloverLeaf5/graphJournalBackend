const express = require("express");
const passport = require("passport");

const router = express.Router();

const successLoginUrl = "http://localhost:3000/login/success";
const errorLoginUrl = "http://localhost:3000/login/error";

// To start the authentication process with Google
router.get(
    "/login/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
);

// The callback after authentication is complete (session already created and serialized)
router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureMessage: "Cannot login to Google, please try again later!",
        failureRedirect: errorLoginUrl,
        successRedirect: successLoginUrl
    }),
    (req, res) => {
        // The user is in the request object as req.user
        console.log("User: ", req.user);
        res.send("Thank you for signing in!");
    }
);

router.get(
    "/logout",
    (req, res) => {
        req.logOut();
        res.send("Logout successful");
    }
);

module.exports = router;