const mongoose = require("mongoose");
const { entryTypes } = require("./entryTypes");

const entrySchema = mongoose.Schema({
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
    type: {
        type: String,
        enum: entryTypes,
        required: [true, 'Please add a type']
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
    }],
    people: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
    }],
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
    }],
    startDate: {
        type: Date,
     //   required: [true, 'Please add the date']
    },
    endDate: {
        type: Date
    },
    title: {
        type: String 
    },
    subtitle: {
        type: String 
    },
    details: {
        type: String 
    },
    location: {
        type: String 
    },
    rating: {
        // Rating from 1-5
        type: Number
    },
    approxTime: {
        // Military time as a whole number 0-2359
        type: Number
    },
    picture: {
        // Key at AWS s3://graph-journal
        type: String 
    },
    APIImage: {
        // URL
        type: String 
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    savedViews: [{  // These are views that this object was saved in
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SavedView',
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model("Entry", entrySchema);