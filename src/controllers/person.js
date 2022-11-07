const Person = require("../models/person");

exports.newPerson = async (req, res) => {
    const personData = req.body;
    const user = req.user._id;
    const userEmail = req.user.email;
    const userGoogleId = req.user.googleId;
    const person = new Person({user, userEmail, userGoogleId, ...personData});
    try{
        await person.save();
        res.json({message: `Created new person`});
    } catch (err) {
        res.json({message: `There was an error`});
    }
};

exports.getPeople = async (req, res) => {
    const user = req.user._id;
    try{
        const allPeople = await Person.find({user: user})
        const people = allPeople.filter((person) => {
            return (!person.isDeleted);
        })
        res.send(people);
    } catch(err) {
        console.log(err);
        res.json({message: `There was an error`});
    }

};

exports.deletePerson = async (req, res) => {
    const currentPersonID = req.body.personId;
    try{
        await Person.findByIdAndUpdate(currentPersonID, {isDeleted: true});
        res.json({message: `Successful person deletion.`})
    } catch (err) {
        console.log(err);
        res.json({message: `There was an error`});
    }
};

exports.updatePerson = async (req, res) => {
    const currentPersonID = req.body.personId;
    const newTitle = req.body.title;
    const newDetails = req.body.details;
    const newPicture = req.body.picture;
    try{
        await Person.findByIdAndUpdate(currentPersonID, {title: newTitle, details: newDetails, picture: newPicture});
        res.json({message: `Successful person update.`})
    } catch (err) {
        console.log(err);
        res.json({message: `There was an error`});
    }
};
