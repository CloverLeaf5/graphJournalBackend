const Group = require("../models/group");

exports.newGroup = async (req, res) => {
    const groupData = req.body;
    const user = req.user._id;
    const userEmail = req.user.email;
    const userGoogleId = req.user.googleId;
    const group = new Group({user, userEmail, userGoogleId, ...groupData});
    try{
        await group.save();
        res.json({message: `Created new group`});
    } catch (err) {
        res.json({message: `There was an error`});
    }
};

exports.getGroups = async (req, res) => {
    const user = req.user._id;
    try{
        const groups = await Group.find({user: user})
        res.send(groups);
    } catch(err) {
        console.log(err);
        res.json({message: `There was an error`});
    }

};