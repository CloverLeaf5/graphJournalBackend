const mongoose = require("mongoose");

const groupSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please add a user']
    },
    userEmail: {
        type: String
    },
    userGoogleId: {
        type: String
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    people: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
        required: [true, 'Please add people']
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model("Group", groupSchema);