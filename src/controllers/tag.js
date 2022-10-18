const Tag = require("../models/tag");

exports.newTag = async (req, res) => {
    const tagData = req.body;
    const user = req.user._id;
    const tag = new Tag({user, ...tagData});
    try{
        await tag.save();
        res.json({message: `Created new tag`});
    } catch (err) {
        res.json({message: `There was an error`});
    }
};