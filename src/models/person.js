const mongoose = require("mongoose");

const personSchema = mongoose.Schema({
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

module.exports = mongoose.model("Person", personSchema);