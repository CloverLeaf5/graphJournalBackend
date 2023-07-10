const Entry = require("../models/entry");
const View = require("../models/view");
const Group = require("../models/group");

// Used to find the entries relevant to a view creation search
// FRONT END MUST STRIP THE TIME FROM THE DATES
exports.findEntries = async (req, res) => {
    const user = req.user._id;
    // Destructure
    const { type, startDateStart, startDateEnd, endDateStart, endDateEnd, tags, groups, people } = req.body;
    // Grab the IDs from tags/people/groups objects
    const tagIDs = [];
    const personIDs = [];
    const groupIDs = [];
    const groupPeopleIDs = [];
    for (const tag of tags) tagIDs.push(tag._id);
    for (const person of people) personIDs.push(person._id);
    for (const group of groups) { // Will also need an array of arrays of the people in each requested grouop
        groupIDs.push(group._id);
        const popGroup = await Group.findById(group).populate("people");
        groupPeopleIDs.push(popGroup.people.map((person) => person._id.toString()));
    }

    // Define a criteria object based on the type, start date, and end dates
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

    // Get all entries that meet the criteria
    try{
        const allEntries = await Entry.find({user: user, ...criteria})
                                        .populate('tags')
                                        .populate('people')
                                        .populate('groups');
        const entriesMinusDeleted = allEntries.filter((entry) => {
            return (!entry.isDeleted);
        })

        // Assure entries have requested tags
        // EntryTagIDs are the current entry's tags
        // tagIDs are the required ones per user criteria (AS STRINGS!!)
        const entriesMinusDeletedT = [];
        for (const entry of entriesMinusDeleted){
            let entryTagIDs = entry.tags.map((tag) => tag._id.toString())
            let hasAllTags = true;
            for (const tag of tagIDs){
                if (!entryTagIDs.includes(tag))
                    hasAllTags = false;
            }
            if (hasAllTags)
                entriesMinusDeletedT.push(entry);
        }

        // Assure entries have requested people
        // See tags above for more details on this
        const entriesMinusDeletedTP = [];
        for (const entry of entriesMinusDeletedT){
            let entryPeopleIDs = entry.people.map((person) => person._id.toString())
            // Also add people that are in groups
            for (const group of entry.groups){
                const popGroup = await group.populate("people");
                if (popGroup.people){
                    let popGroupIDs = popGroup.people.map((person) => person._id.toString())
                    for (const person of popGroupIDs){
                        // Add the group people to the ID list if they aren't there already
                        if (!entryPeopleIDs.includes(person)){
                            entryPeopleIDs.push(person);
                        }
                    }
                }
                
            }
            
            let hasAllPeople = true;
            for (const person of personIDs)
                if (!entryPeopleIDs.includes(person))
                    hasAllPeople = false;
            if (hasAllPeople)
                entriesMinusDeletedTP.push(entry);
        }

        // Assure entries have requested groups
        // See tags above for more details on this
        const entriesMinusDeletedTPG = [];
        for (const entry of entriesMinusDeletedTP){
            let entryGroupIDs = entry.groups.map((group) => group._id.toString())
            let entryPeopleIDs = entry.people.map((person) => person._id.toString())
            let hasAllGroups = true;
            for (const [index, group] of groupIDs.entries()) // Loop through each of the requested groups
                if (!entryGroupIDs.includes(group)){
                    // Also check if all the people from the group are listed individually
                    if (groupPeopleIDs[index].length > 0){
                        for (const person of groupPeopleIDs[index]){
                            // If any person from the group is not in the entry, then it can be falsified
                            if (!entryPeopleIDs.includes(person)){
                                hasAllGroups = false;
                                break;
                            }
                        }
                    } else { // If the group is empty then it needs to have the group itself tagged
                        hasAllGroups = false;
                    }
                }
            if (hasAllGroups)
                entriesMinusDeletedTPG.push(entry);
        }
        
        // Sort entries from most recent to oldest
        const sortedEntries = entriesMinusDeletedTPG.sort((entryA, entryB) =>
            (Number(entryB.startDate) - Number(entryA.startDate)) || (Number(entryB.approxTime) - Number(entryA.approxTime))
        )

        // Need to get the tags/people/groups in each entry to see if they are deleted
        // This can be done more quickly by populating above
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

// Save the new view to the database
exports.saveView = async (req, res) => {
    const viewData = req.body;
    const user = req.user._id;
    const userEmail = req.user.email;
    const userGoogleId = req.user.googleId;
    const view = new View({user, userEmail, userGoogleId, ...viewData});
    try{
        const savedView = await view.save();
        res.send(savedView);
    } catch (err) {
        res.json({message: `There was an error`});
    }
};

// Update a view with data from the front end
exports.updateView = async (req, res) => {
    const currentViewId = req.body.viewId;
    const viewObject = {...req.body};
    delete viewObject.viewId;
    try{
        const updatedView = await View.findByIdAndUpdate(currentViewId, viewObject);
        res.send(updatedView);
    } catch (err) {
        console.log(err);
        res.json({message: `There was an error`});
    }
};

// Mark a view as deleted
exports.deleteView = async (req, res) => {
    const currentViewId = req.body.viewId;
    try{
        await View.findByIdAndUpdate(currentViewId, {isDeleted: true});
        res.json({message: `Successful view deletion.`})
        
    } catch (err) {
        console.log(err);
        res.json({message: `There was an error`});
    }
};

// Returns an array of all saved view objects complete with their entries (unpopulated with groups/tags/people)
exports.getSavedViews = async (req, res) => {
    const user = req.user._id;
    try{
        const allViews = await View.find({user: user})
        .populate('entries')
        const views = allViews.filter((view) => {
            return (!view.isDeleted);
        })
        // Need to filter out the deleted entries
        for (const view of views) {
            const correctEntries = [];
            for (const entry of view.entries) {
                if (!entry.isDeleted)
                    correctEntries.push(entry)
            }
            view.entries = correctEntries;
        }
        res.send(views);
    } catch(err) {
        console.log(err);
        res.json({message: `There was an error`});
    }

};

// Receives an array of entries from a view that has only IDs for tags, people, and groups
// Returns an array of all of the entries in the view along with their tags, people, and groups populated
// To be used after selecting a view from the list of all views on the front end
// First does another database call on the entries so they can be populated with fewer DB calls
exports.populateViewEntries = async (req, res) => {
    let entryArray = req.body.entryArray;
    let entryIDs = entryArray.map((entry) => entry._id);
    try {
        const populatedEntries = await Entry.find({
            '_id': { $in: entryIDs}
        })
        .populate('tags')
        .populate('people')
        .populate('groups');
        for (const entry of populatedEntries) {
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
    } catch(err) {console.log(err)};

    res.send(entryArray);
};