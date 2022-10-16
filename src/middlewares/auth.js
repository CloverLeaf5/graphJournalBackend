const isUserAuthenticated = (req, res, next) => {
    // This works because Passport will modify req.user based on the session token stored in the cookie when deserializing
    if (req.user) {
        next();
    } else {
        res.status(401).send("You must login first!");
    }
}

module.exports = isUserAuthenticated;