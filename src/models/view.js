const mongoose = require("mongoose");

const viewSchema = mongoose.Schema({
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
    entries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entry'
    }],
    viewType: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("View", viewSchema);