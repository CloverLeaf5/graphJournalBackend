const mongoose = require("mongoose");

const personSchema = mongoose.Schema({
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
        required: [true, 'Please add a name']
    },
    details: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Person", personSchema);