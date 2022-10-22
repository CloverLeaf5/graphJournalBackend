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
        const tags = await Tag.find({user: user})
        res.send(tags);
    } catch(err) {
        console.log(err);
        res.json({message: `There was an error`});
    }

};