const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    googleId: {
        type: String,
        required: [true, 'Please add an id']
    },
    fullName: {
        type: String,
        required: [true, 'Please add  full name']
    },
    firstName: {
        type: String,
        required: [true, 'Please add a first name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email']
    },
    role: {
        // 0 for User
        // 1 for Admin
        // 2 for Owner
        type: Number,
        required: [true, 'Please add a permission level']
    },
    permission: {
        // 0 is the only option for now
        type: Number,
        default: 0,
        required: [true, 'Please add a permission level']
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);