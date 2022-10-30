const Entry = require("../models/entry");
const Tag = require("../models/tag");
const Group = require("../models/group");
const Person = require("../models/person");
const { entryTypes, entryTypesWithText } = require("../models/entryTypes");
const { getMovies, getShows } = require("./apiHelperFunctions");
const S3 = require('aws-sdk/clients/s3');

let APIData;
let currentEntryID = "";

exports.newEntry = async (req, res) => {
    APIData = [];
    const entryData = req.body;
    const user = req.user._id;
    const userEmail = req.user.email;
    const userGoogleId = req.user.googleId;
    const entryObject = {user, userEmail, userGoogleId, ...entryData}
    // Turn Rating and Time numbers from strings into numbers
    if (entryObject.rating) entryObject.rating = Number(entryObject.rating)
    if (entryObject.approxTime) entryObject.approxTime = Number(entryObject.approxTime)
    const cleanedEntryObject = removeEmptyProperties(entryObject)
    // Decide whether to use a picture and the Google API location
    if (cleanedEntryObject.pictures.length>0) cleanedEntryObject.whichImage = 1;
    else cleanedEntryObject.whichImage = 0;
    const entry = new Entry(cleanedEntryObject);
    currentEntryID = entry._id;
    try{
        await entry.save();
        // If movie or show, use TMDB to get posters
        if (entryData.type === "movie"){
            APIData = await getMovies(entryObject.title).catch((err) => {
                console.log(err);
            });
        }
        if (entryData.type === "show"){
            APIData = await getShows(entryObject.title).catch((err) => {
                console.log(err);
            });
        }
        res.send(APIData);
    } catch (err) {
        res.json({message: `There was an error`});
    }
};

exports.updateAPIImage = async (req, res) => {
    if (APIData.length === 0) return;
    
    const index = req.body.arraySelection;
    const APIImageDBURL = APIData[index].imageDBPath;
    const APIImagePathURL = APIData[index].imagePosterPath;
    const whichImage = 2;
    try{
        await Entry.findByIdAndUpdate(currentEntryID, {APIImageDBPath: APIImageDBURL,
                                                        APIImagePath: APIImagePathURL,
                                                        whichImage: whichImage});
        APIData = [];
        currentEntryID = "";
    } catch (err) {
        res.json({message: `There was an error`});
    }
};

// FRONT END MUST STRIP THE TIME FROM THE DATES
exports.getEntries = async (req, res) => {
    const user = req.user._id;
    try{
        const allEntries = await Entry.find({user: user})
        const entries = allEntries.filter((entry) => {
            return (!entry.isDeleted);
        })
        
        // Sort entries from most recent to oldest
        const sortedEntries = entries.sort((entryA, entryB) =>
            Number(entryB.startDate) - Number(entryA.startDate)
        )
        // Need to get the tags/people/groups in each entry to see if they are deleted
        for (const entry of sortedEntries) {
            // TAGS
            const fullTagArray = [];
            for (const tag of entry.tags) {
                try {
                    fullTag = await Tag.findById(tag)
                    if (!fullTag.isDeleted)
                        fullTagArray.push(fullTag);
                } catch(err) {
                    console.log(err);
                }
            }
            entry.tags = fullTagArray;
            // PEOPLE
            const fullPeopleArray = [];
            for (const person of entry.people) {
                try {
                    fullPerson = await Person.findById(person)
                    if (!fullPerson.isDeleted)
                        fullPeopleArray.push(fullPerson);
                } catch(err) {
                    console.log(err);
                }
            }
            entry.people = fullPeopleArray;
            // GROUPS
            const fullGroupArray = [];
            for (const group of entry.groups) {
                try {
                    fullGroup = await Group.findById(group)
                    if (!fullGroup.isDeleted)
                    fullGroupArray.push(fullGroup);
                } catch(err) {
                    console.log(err);
                }
            }
            entry.groups = fullGroupArray;
        }
        res.send(sortedEntries);
    } catch(err) {
        console.log(err);
        res.json({message: `There was an error`});
    }
};


exports.updateEntry = async (req, res) => {
    APIData = [];
    const currentEntry = req.body.entryId;
    const entryObject = {...req.body};
    delete entryObject.entryId;
    // Turn Rating and Time numbers from strings into numbers
    if (entryObject.rating) entryObject.rating = Number(entryObject.rating)
    if (entryObject.approxTime) entryObject.approxTime = Number(entryObject.approxTime)
    const cleanedEntryObject = removeEmptyProperties(entryObject)
    if (cleanedEntryObject.pictures.length>0) cleanedEntryObject.whichImage = 1;
    else cleanedEntryObject.whichImage = 0;
    currentEntryID = currentEntry;
    try{
        await Entry.findByIdAndUpdate(currentEntry, cleanedEntryObject);
        // If movie or show, use TMDB to get posters
        if (cleanedEntryObject.type === "movie"){
            APIData = await getMovies(entryObject.title).catch((err) => {
                console.log(err);
            });
        }
        if (cleanedEntryObject.type === "show"){
            APIData = await getShows(entryObject.title).catch((err) => {
                console.log(err);
            });
        }
        res.send(APIData);
    } catch (err) {
        console.log(err);
        res.json({message: `There was an error`});
    }
};


exports.deleteEntry = async (req, res) => {
    const currentEntryID = req.body.entryId;
    try{
        await Entry.findByIdAndUpdate(currentEntryID, {isDeleted: true});
        res.json({message: `Successful entry deletion.`})
        
    } catch (err) {
        console.log(err);
        res.json({message: `There was an error`});
    }
};


exports.getEntryTypes = (req, res) => {
    res.send(entryTypes);
};

exports.getEntryTypesWithText = (req, res) => {
    res.send(entryTypesWithText);
};

exports.getAWSPhotoURL = (req, res) => {
    const s3 = new S3({
        apiVersion: '2006-03-01',
        region: 'us-east-1'
      });
    const params = {Bucket: `${process.env.S3_BUCKET}`, Key: `${req.body.s3Key}`};
    s3.getSignedUrlPromise('getObject', params, function(err, url) {
        if (err) {
          console.log("Error", err);
          res.json({message: `There was an error`});
        } else {
          res.send(url)
        }
      });
};


const removeEmptyProperties = (submission) => {
    // if (submission.tags.length === 0) delete submission.tags
    // if (submission.people.length === 0) delete submission.people
    // if (submission.groups.length === 0) delete submission.groups
    // if (submission.startDate.length === 0) delete submission.startDate
    // if (submission.endDate.length === 0) delete submission.endDate
    // if (submission.title.length === 0) delete submission.title
    // if (submission.subtitle.length === 0) delete submission.subtitle
    // if (submission.details.length === 0) delete submission.details
    // if (submission.location.length === 0) delete submission.location
    // if ((typeof submission.APILocationLat !== "number") ||
    //     (submission.APILocationLat.length === 0)) delete submission.APILocationLat
    //     if ((typeof submission.APILocationLng !== "number") ||
    //     (submission.APILocationLng.length === 0)) delete submission.APILocationLng
    // if (submission.APILocationString.length === 0) delete submission.APILocationString
    // if ((typeof submission.rating !== "number") ||
    //     (submission.rating < 1) ||
    //     (submission.rating > 5) ) delete submission.rating
    // if ((typeof submission.approxTime !== "number") ||
    //     (submission.approxTime < 0) ||
    //     (submission.approxTime > 2359) ) delete submission.approxTime
    cleanUpPictures(submission.pictures) // Remove any entries with an empty field
    // if (submission.pictures.length === 0) delete submission.pictures
    cleanUpMetrics(submission.metrics) // Remove any entries with an empty field
    // if (submission.metrics.length === 0) delete submission.metrics

    return submission;
}

const cleanUpPictures = (pictures) => {
    console.log(pictures)
    let numSpliced = 0;
    for (let i=0; i<pictures.length+numSpliced; i++){
        if (!(pictures[i-numSpliced].location)){
            pictures.splice(i-numSpliced,1);
            numSpliced++;
        }
    }
}

const cleanUpMetrics = (metrics) => {
    console.log(metrics)
    let numSpliced = 0;
    for (let i=0; i<metrics.length+numSpliced; i++){
        if (!(metrics[i-numSpliced].name) || !(metrics[i-numSpliced].data)){
            metrics.splice(i-numSpliced,1);
            numSpliced++;
        }
    }
}





// GET IMAGES FROM S3 TO REACT

// var params = {Bucket: 'xxx-xx-xxx', Key: '1.jpg'};
// var promise = s3.getSignedUrlPromise('getObject', params);
// promise.then(function(url) {
//   res.send(url)
// }, function(err) { console.log(err) });

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property