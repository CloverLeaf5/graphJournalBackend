const Group = require("../models/group");
const Person = require("../models/person");

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
        const allGroups = await Group.find({user: user})
        .populate('people');
        const groups = allGroups.filter((group) => {
            return (!group.isDeleted);
        })
        // Need to filter any people in each group who are deleted
        for (const group of groups) {
            const correctPeople = [];
            for (const person of group.people) {
                if (!person.isDeleted)
                correctPeople.push(person);
            }
            group.people = correctPeople;
        }
        res.send(groups);
    } catch(err) {
        console.log(err);
        res.json({message: `There was an error`});
    }

};

exports.deleteGroup = async (req, res) => {
    const currentGroupID = req.body.groupId;
    try{
        await Group.findByIdAndUpdate(currentGroupID, {isDeleted: true});
        res.json({message: `Successful group deletion.`})
    } catch (err) {
        console.log(err);
        res.json({message: `There was an error`});
    }
};

exports.updateGroup = async (req, res) => {
    const currentGroupID = req.body.groupId;
    const newTitle = req.body.title;
    const newPeople = req.body.groupPeople;
    const newDetails = req.body.details;
    const newPicture = req.body.picture;
    try{
        await Group.findByIdAndUpdate(currentGroupID, {title: newTitle, people: newPeople,
                                                        details: newDetails, picture: newPicture});
        res.json({message: `Successful group update.`})
    } catch (err) {
        console.log(err);
        res.json({message: `There was an error`});
    }
};