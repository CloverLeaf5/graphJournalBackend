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
    typeText: {
        type: String,
        required: [true, 'Please add the type text']
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
        required: [true, 'Please add the date']
    },
    endDate: {
        type: Date
    },
    title: {
        type: String,
        required: [true, 'Please add the title']
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
    APILocationLat: {
        type: Number
    },
    APILocationLng: {
        type: Number
    },
    APILocationString: {
        type: String
    },
    useAPILocation: {
        type: Boolean,
        default: false
    },
    rating: {
        // Rating from 1-5
        type: Number
    },
    isStarred: {
        // If is important
        type: Boolean,
        default: false
    },
    isAchievement: {
        // If represents a milestone within the type
        type: Boolean,
        default: false
    },
    approxTime: {
        // Military time as a whole number 0-2359
        type: Number,
        default: 0
    },
    // Store custom metrics to be tracked across goal progress or other type
    // Think miles run in marathon training
    metrics: [{
        name: {
            type: String
        },
        data: {
            type: Number
        }
    }],
    pictures: [{
        location: {
            // Key at AWS s3://graph-journal
            type: String 
        },
        caption: {
            type: String 
        }
    }],
    // Deprecated in favor of S3 below
    APIImageDBPath: {
        // URL which is prepended before Image Path
        type: String 
    },
    // Deprecated in favor of S3 below
    APIImagePath: {
        // URL which is appended after DB Path
        type: String 
    },
    APIImageS3Key: {
        // S3 Key at AWS s3://graph-journal
        type: String
    },
    whichImage: {
        // 0 for none, 1 for S3, 2 for APIImage
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Entry", entrySchema);