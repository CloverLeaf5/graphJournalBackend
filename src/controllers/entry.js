const Entry = require("../models/entry");

exports.newEntry = async (req, res) => {
    const entryData = req.body;
    const user = req.user._id;
    const entry = new Entry({user, ...entryData});
    try{
        await entry.save();
        res.json({message: `Created new document`});
    } catch (err) {
        res.json({message: `There was an error`});
    }
};