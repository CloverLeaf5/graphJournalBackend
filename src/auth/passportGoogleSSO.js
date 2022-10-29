const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/user");

const GOOGLE_CALLBACK_URL = "http://localhost:5000/api/v1/auth/google/callback";


// Performs both registration and login
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
                firstName: profile.name.givenName,
                email: profile.emails[0].value,
                googleId: profile.id
            };

            try{
                const existingUser = await User.findOne({ googleId: profile.id });
                if (existingUser) {
                    return done(null, existingUser);
                }
                console.log("Creating new user");
                currentUser.role = 0;
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

// Puts the user id into the session token
passport.serializeUser((user, done) => {
   // console.log("Serializing user:", user);
    return done(null, user.id);
});


// Pulls the id from the session token and tries to find the user in the DB
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
     //   console.log("Deserialized user", user);
        if (user) done(null, user);
        else {
            console.log("User not found")
            done(null, null);
        }
    } catch(err) {
        console.log("Error deserializing", err);
        done(err, null);
    }
    
});