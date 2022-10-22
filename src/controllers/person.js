const Person = require("../models/person");

exports.newPerson = async (req, res) => {
    const personData = req.body;
    const user = req.user._id;
    const userEmail = req.user.email;
    const userGoogleId = req.user.googleId;
    const person = new Person({user, userEmail, userGoogleId, ...personData});
    console.log(person);
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
        const people = await Person.find({user: user})
        res.send(people);
    } catch(err) {
        console.log(err);
        res.json({message: `There was an error`});
    }

};
