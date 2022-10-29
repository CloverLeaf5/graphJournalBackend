const Entry = require("../models/entry");
const Tag = require("../models/tag");
const Person = require("../models/person");
const Group = require("../models/group");
const View = require("../models/view");

// FRONT END MUST STRIP THE TIME FROM THE DATES
exports.findEntries = async (req, res) => {
    const user = req.user._id;
    // Destructure
    const { type, startDateStart, startDateEnd, endDateStart, endDateEnd, tags, groups, people } = req.body;
    // Grab the IDs from tags/people/groups objects
    const tagIDs = [];
    const personIDs = [];
    const groupIDs = [];
    for (const tag of tags) tagIDs.push(tag._id);
    for (const person of people) personIDs.push(person._id);
    for (const group of groups) groupIDs.push(group._id);

    const criteria = {};
    if (type !== "nothing")
        criteria.type = type;
    if (startDateStart.length > 0 || startDateEnd.length > 0){
        criteria.startDate = {};
        if (startDateStart.length > 0)
            criteria.startDate.$gte = startDateStart;
        if (startDateEnd.length > 0)
            criteria.startDate.$lte = startDateEnd;
    }
    
    if (endDateStart.length > 0 || endDateEnd.length > 0){
        criteria.endDate = {};
        if (endDateStart.length > 0)
            criteria.endDate.$gte = endDateStart;
        if (endDateEnd.length > 0)
            criteria.endDate.$lte = endDateEnd;
    }

    try{
        const allEntries = await Entry.find({user: user, ...criteria})
        const entriesMinusDeleted = allEntries.filter((entry) => {
            return (!entry.isDeleted);
        })

        // Assure entries have requested tags
        const entriesMinusDeletedT = [];
        for (const entry of entriesMinusDeleted){
            let hasAllTags = true;
            for (const tag of tagIDs)
                if (!entry.tags.includes(tag))
                    hasAllTags = false;
            if (hasAllTags)
                entriesMinusDeletedT.push(entry);
        }

        // Assure entries have requested people
        const entriesMinusDeletedTP = [];
        for (const entry of entriesMinusDeletedT){
            let hasAllPeople = true;
            for (const person of personIDs)
                if (!entry.people.includes(person))
                    hasAllPeople = false;
            if (hasAllPeople)
                entriesMinusDeletedTP.push(entry);
        }

        // Assure entries have requested groups
        const entriesMinusDeletedTPG = [];
        for (const entry of entriesMinusDeletedTP){
            let hasAllGroups = true;
            for (const group of groupIDs)
                if (!entry.groups.includes(group))
                    hasAllGroups = false;
            if (hasAllGroups)
                entriesMinusDeletedTPG.push(entry);
        }
        
        // Sort entries from most recent to oldest
        const sortedEntries = entriesMinusDeletedTPG.sort((entryA, entryB) =>
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


exports.saveView = async (req, res) => {
    const viewData = req.body;
    const user = req.user._id;
    const userEmail = req.user.email;
    const userGoogleId = req.user.googleId;
    console.log(viewData)
    const view = new View({user, userEmail, userGoogleId, ...viewData});
    console.log(view)
    try{
        const savedView = await view.save();
        res.send(savedView);
    } catch (err) {
        res.json({message: `There was an error`});
    }
};