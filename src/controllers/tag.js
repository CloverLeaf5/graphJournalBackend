const Entry = require("../models/entry");
const Tag = require("../models/tag");

exports.newTag = async (req, res) => {
    const tagData = req.body;
    const user = req.user._id;
    const userEmail = req.user.email;
    const userGoogleId = req.user.googleId;
    const tag = new Tag({user, userEmail, userGoogleId, ...tagData});
    try{
        await tag.save();
        res.json({message: `Created new tag`});
    } catch (err) {
        res.json({message: `There was an error`});
    }
};

exports.getTags = async (req, res) => {
    const user = req.user._id;
    try{
        const allTags = await Tag.find({user: user})
        const tags = allTags.filter((tag) => {
            return (!tag.isDeleted);
        })
        res.send(tags);
    } catch(err) {
        console.log(err);
        res.json({message: `There was an error`});
    }

};

exports.deleteTag = async (req, res) => {
    const currentTagID = req.body.tagId;
    try{
        await Tag.findByIdAndUpdate(currentTagID, {isDeleted: true});
        res.json({message: `Successful tag deletion.`})
    } catch (err) {
        console.log(err);
        res.json({message: `There was an error`});
    }
};

exports.updateTag = async (req, res) => {
    const currentTagID = req.body.tagId;
    const newTitle = req.body.title;
    const newDetails = req.body.details;
    const newPicture = req.body.picture;
    try{
        await Tag.findByIdAndUpdate(currentTagID, {title: newTitle, details: newDetails, picture: newPicture});
        res.json({message: `Successful tag update.`})
    } catch (err) {
        console.log(err);
        res.json({message: `There was an error`});
    }
};