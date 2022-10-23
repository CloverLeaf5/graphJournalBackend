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
        const groups = allGroups.filter((group) => {
            return (!group.isDeleted);
        })
        // Need to get the people in each group
        for (const group of groups) {
            const fullPeopleArray = [];
            for (const person of group.people) {
                try {
                    fullPerson = await Person.findById(person)
                    if (!fullPerson.isDeleted)
                        fullPeopleArray.push(fullPerson);
                } catch(err) {
                    console.log(err);
                }
            }
            group.people = fullPeopleArray;
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
    try{
        await Group.findByIdAndUpdate(currentGroupID, {title: newTitle, people: newPeople});
        res.json({message: `Successful group update.`})
    } catch (err) {
        console.log(err);
        res.json({message: `There was an error`});
    }
};