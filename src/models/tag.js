const mongoose = require("mongoose");

const tagSchema = mongoose.Schema({
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
        required: [true, 'Please add a tag']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Tag", tagSchema);