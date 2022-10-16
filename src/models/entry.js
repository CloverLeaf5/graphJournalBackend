const mongoose = require("mongoose");

const entrySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please add a user']
    },
    type: {
        type: String,
        required: [true, 'Please add a type']
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
    }],
    otherPeople: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
    }],
    startDate: {
        type: Date,
        required: [true, 'Please add the date']
    },
    endDate: {
        type: Date
    },
    title: {
        type: String 
    },
    details: {
        type: String 
    },
    approxTime: {
        // Military time as a whole number 0-2359
        type: Number
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Entry", entrySchema);