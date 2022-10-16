const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const cookieSession = require("cookie-session");
const passport = require("passport");
const connectDB = require("./database");

require("./auth/passportGoogleSSO");


//require("./models/user");

//const middlewares = require("./middlewares");
const api = require("./api");

const app = express();

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
//app.use(morgan("dev"));
app.use(
    helmet({ crossOriginOpenerPolicy: { policy: "unsafe-none" } })
  );


app.use(cors({
    origin: `${process.env.FRONTEND}`,
    credentials: true
}));
app.use(express.json());
app.use(
    cookieSession({
        maxAge: 24 * 60 * 60 * 1000,
        name: "google-auth-session",
        keys: [process.env.COOKIE_KEY]
    })
);
app.use(passport.initialize());
app.use(passport.session());

connectDB();

app.use("/api/v1", api);

//app.use(middlewares.notFound);
//app.use(middlewares.errorHandler);




app.get("/", (req, res) => {
    res.json({
        message: "Test homepage success!"
    });
});

module.exports = app;