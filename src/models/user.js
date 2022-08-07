const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    googleId: {
        type: String,
        required: [true, 'Please add an id']
    },
    fullName: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);