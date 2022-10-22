const Entry = require("../models/entry");
const { entryTypes, entryTypesWithText } = require("../models/entryTypes");
const { getMovies } = require("./apiHelperFunctions");

let APIData = [];
let currentEntryID = "";

exports.newEntry = async (req, res) => {
    APIData = [];
    const entryData = req.body;
    const user = req.user._id;
    const userEmail = req.user.email;
    const userGoogleId = req.user.googleId;
    const entryObject = {user, userEmail, userGoogleId, ...entryData}
    const entry = new Entry(removeEmptyProperties(entryObject));
    currentEntryID = entry._id;
    try{
        await entry.save();
        if (entryData.type === "movie"){
            APIData = await getMovies(entryObject.title).catch((err) => {
                console.log(err);
            });
        }
        console.log(APIData)
        res.send(APIData);
    } catch (err) {
        res.json({message: `There was an error`});
    }
};

exports.updateAPIImage = async (req, res) => {
    const index = req.body.arraySelection;
    const APIImageURL = APIData[index].image;
    try{
        await Entry.findByIdAndUpdate(currentEntryID, {APIImage: APIImageURL})
        APIData = [];
        currentEntryID = "";
    } catch (err) {
        res.json({message: `There was an error`});
    }
};

exports.getEntryTypes = (req, res) => {
    res.send(entryTypes);
};

exports.getEntryTypesWithText = (req, res) => {
    res.send(entryTypesWithText);
};


const removeEmptyProperties = (submission) => {
    if (submission.tags.length === 0) delete submission.tags
    if (submission.people.length === 0) delete submission.people
    if (submission.groups.length === 0) delete submission.groups
    if (submission.startDate.length === 0) delete submission.startDate
    if (submission.endDate.length === 0) delete submission.endDate
    if (submission.title.length === 0) delete submission.title
    if (submission.details.length === 0) delete submission.details
    if (submission.location.length === 0) delete submission.location
    if ((typeof submission.approxTime !== "number") ||
        (submission.approxTime < 0) ||
        (submission.approxTime > 2359) ) delete submission.approxTime
    if (submission.picture.length === 0) delete submission.picture

    return submission;
}





// GET IMAGES FROM S3 TO REACT

// var params = {Bucket: 'xxx-xx-xxx', Key: '1.jpg'};
// var promise = s3.getSignedUrlPromise('getObject', params);
// promise.then(function(url) {
//   res.send(url)
// }, function(err) { console.log(err) });

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property