const Entry = require("../models/entry");
const { entryTypes, entryTypesWithText } = require("../models/entryTypes");
const { getMovies, getShows, getBooks } = require("./apiHelperFunctions");
const Counter = require("../models/counter");
const User = require("../models/user")
const S3 = require('aws-sdk/clients/s3');
const axios = require("axios");

// This will need to be updated to a library if multiple users are using at once
let APIData = [];
let currentEntryID = "";

// Input a brand new entry
exports.newEntry = async (req, res) => {
    APIData = []; // For the later returned API data
    const entryData = req.body;
    // User info
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
    // Assure that all fields are present
    cleanedEntryObject.APIImageDBPath = "";
    cleanedEntryObject.APIImagePath = "";
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
        if (cleanedEntryObject.type === "book"){
            APIData = await getBooks(entryObject.title).catch((err) => {
                console.log(err);
            });
        }
        res.send(APIData);
    } catch (err) {
        res.json({message: `There was an error`});
    }
};

// Called from the front end when the user selects which image to use from the above API searches
exports.updateAPIImage = async (req, res) => {
    if (APIData.length === 0) return;
    
    const index = req.body.arraySelection;
    if (index < 0) return;

    const APIImageDBURL = APIData[index].imageDBPath;
    const APIImagePathURL = APIData[index].imagePosterPath;
    const keyRaw = APIData[index].title;
    const keyClean = keyRaw.replace(/[^A-Za-z0-9]/g, ""); // Use regex to remove non-alphanumeric characters
    let APIImageCounter;
    // Get the current API Image Counter from the DB which counts all images coming in
    // This is appended to the image name and assures unique entries
    try{
        APIImageCounter = await Counter.findOne({ title: 'APIImageCounter', user: req.user._id });
        if (!APIImageCounter) { // This is the first time and must create the entry
            try{
                const currentUser = User.findById(req.user._id);
                if (!currentUser){
                    console.log("Unable to find the current user");
                    res.json({message: `There was an error creating the API Image Counter- Unable to find the current user`});
                }
                APIImageCounter = new Counter({ user: req.user._id,
                                            userEmail: currentUser.userEmail,
                                            userGoogleId: currentUser.userGoogleId,
                                            title: 'APIImageCounter',
                                            count: 0 });
                APIImageCounter.save();
            }catch (err) {
                console.log(err);
                res.json({message: `There was an error creating the API Image Counter`});
            }
        }
    } catch (err) {
        console.log(err);
        res.json({message: `There was an error getting the API Image Counter`});
    }
    const currentCount = APIImageCounter.count;
    const keyTitle = new String(keyClean).concat("_" + currentCount + ".jpg");
    const fullKey = "Patrick/Media-API-Images/" + keyTitle;

    // Get the image and put it in S3
    const s3 = new S3({
        apiVersion: '2006-03-01',
        region: 'us-east-1'
      });

    try {
        const response = await axios.get(APIImageDBURL + APIImagePathURL, {responseType: 'arraybuffer'});  // Corrupts the JPG without this responseType
        if (response && response.data){
            //imageFromAPI = response.data;
            s3.putObject({Bucket: `${process.env.S3_BUCKET}`, Key: fullKey, Body: response.data}).promise().then(
                function(data) {
                  // Don't need to do anything
              }).catch(
                function(err) {
                    console.log(err);
                    res.json({message: `There was an error writing to S3`});
              });
        } else {
            console.log(err);
            res.json({message: `Did not get a reponse image from the API`});
        }
    } catch(err) {
        console.log("Something went wrong with getting the Image from the API");
    }

    // Update the DB API Image counter and save it back to the DB
    try {
        APIImageCounter.count += 1;
        await Counter.findOneAndUpdate({ title: 'APIImageCounter', user: req.user._id }, new Counter(APIImageCounter));
    } catch (err) {
        console.log(err);
        res.json({message: `There was an error saving the count after writing to S3`});
    }
    
    // Store in the DB that this entry is using an API image
    const whichImage = 2;
    try{
        await Entry.findByIdAndUpdate(currentEntryID, {APIImageDBPath: APIImageDBURL,
                                                        APIImagePath: APIImagePathURL,
                                                        APIImageS3Key: fullKey,
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
                                    .populate('tags')
                                    .populate('people')
                                    .populate('groups');
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
                if (!tag.isDeleted)
                    fullTagArray.push(tag);
            }
            entry.tags = fullTagArray;
            // PEOPLE
            const fullPeopleArray = [];
            for (const person of entry.people) {
                if (!person.isDeleted)
                    fullPeopleArray.push(person);
            }
            entry.people = fullPeopleArray;
            // GROUPS
            const fullGroupArray = [];
            for (const group of entry.groups) {
                if (!group.isDeleted)
                    fullGroupArray.push(group);
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
        if (cleanedEntryObject.type === "book"){
            APIData = await getBooks(entryObject.title).catch((err) => {
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
    let numSpliced = 0;
    for (let i=0; i<pictures.length+numSpliced; i++){
        if (!(pictures[i-numSpliced].location)){
            pictures.splice(i-numSpliced,1);
            numSpliced++;
        }
    }
}

const cleanUpMetrics = (metrics) => {
    let numSpliced = 0;
    for (let i=0; i<metrics.length+numSpliced; i++){
        if (!(metrics[i-numSpliced].name) || !(metrics[i-numSpliced].data)){
            metrics.splice(i-numSpliced,1);
            numSpliced++;
        }
    }
}