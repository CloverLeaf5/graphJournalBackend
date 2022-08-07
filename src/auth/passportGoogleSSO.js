const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/user");

const GOOGLE_CALLBACK_URL = "http://localhost:5000/api/v1/auth/google/callback";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            callbackURL: GOOGLE_CALLBACK_URL,
            passReqToCallback: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
            const currentUser = {
                fullName: `${profile.name.givenName} ${profile.name.familyName}`,
                email: profile.emails[0].value,
                googleId: profile.id
            };

            try{
                const existingUser = await User.findOne({ googleId: profile.id });
                if (existingUser) {
                    console.log("Found existing user");
                    return (done, existingUser);
                }
                console.log("Creating new user");
                const newUser = new User(currentUser);
                await newUser.save();
                return done(null, newUser);
            } catch (err) {
                console.log("There was an error in signup");
                return done(err, null);
            }
                
        }
    )
);

passport.serializeUser((user, done) => {
    console.log("Serializing user:", user);
    return done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        if (err) {
            console.log("Error deserializing", err);
            done(err, null);
        } else {
            console.log("Deserialized user", user);
            if (user) done(null, user);
        }
    });
})