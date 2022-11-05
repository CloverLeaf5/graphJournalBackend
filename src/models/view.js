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
    // Title of the view
    title: {
        type: String,
        required: [true, 'Please add a name']
    },
    // Details about the view
    details: {
        type: String
    },
    // Array of IDs in order
    entries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entry'
    }],
    entryDisplayTypes: [{
        // An array of strings denoting the display type of each entry in the view in traditional mode
        // Index here will correspond to the index of the entries array
        // "default" denotes the basic card display
        type: String,
        default: "default"
    }],
    // Currently Table, Traditional
    viewType: {
        type: String
    },
    // Whether or not to use the Google Map on the front end
    useGoogleMap: {
        type: Boolean
    },
    // Where the Google Map is centered in the view
    googleMapCenterLat: {
        type: Number
    },
    googleMapCenterLng: {
        type: Number
    },
    // The zoom level of the Google Map
    googleMapZoom: {
        type: Number
    },
    // The type of the map (satellite vs map) extracted from the map on save
    googleMapTypeId: {
        type: String
    },
    // Whether events should be displayed in chronological or most recent first order
    mostRecentFirst: {
        type: Boolean,
        default: true
    },
    // If the view was deleted
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("View", viewSchema);