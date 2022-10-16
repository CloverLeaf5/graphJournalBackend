const mongoose = require("mongoose");

const tagSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please add a user']
    },
    title: {
        type: String 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Tag", tagSchema);