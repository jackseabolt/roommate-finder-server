'use strict'; 

const express = require('express'); 
const bodyParser = require('body-parser'); 
const { User } = require('./models'); 
const router = express.Router(); 
const jsonParser = bodyParser.json(); 



// ROUTE TO CREATE USERS INITIALLY
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['username', 'password', 'looking_for'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'Validation Error',
            message: 'Missing field',
            location: missingField
        });
    }

    const stringFields = ['username', 'password'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== 'string'
    );

    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reson: 'Validation Error',
            message: 'Incorrect field type: expect string',
            location: nonStringField
        });
    }

    const explicityTrimmedFields = ['username', 'password'];
    const nonTrimmedField = explicityTrimmedFields.find(
        field => req.body[field].trim() !== req.body[field]
    );

    if (nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Cannot start or end with whitespace',
            location: nonTrimmedField
        });
    }

    const sizedFields = {
        username: { min: 1 },
        password: { min: 10, max: 72 }
    };
    const tooSmallField = Object.keys(sizedFields).find(field =>
        'min' in sizedFields[field] &&
        req.body[field].trim().length < sizedFields[field].min
    );
    const tooLargeField = Object.keys(sizedFields).find(field =>
        'max' in sizedFields[field] &&
        req.body[field].trim().length > sizedFields[field].max
    );

    if (tooSmallField || tooLargeField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField
                ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
                : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
            location: tooSmallField || tooLargeField
        });
    }

    let { username, password, looking_for } = req.body;
    return User.find({ username })
        .count()
        .then(count => {
            if (count > 0) {
                return Promise.reject({
                    code: 422,
                    reason: 'Validation Error',
                    message: 'Username already taken',
                    location: 'username'
                })
            }
            return User.hashPassword(password)
        })
        .then(data => {
            return User.create({ username, password: data, looking_for });
        })
        .then(user => {
            return res.status(201).json(user.apiRepr());
        })
        .catch(err => {
            if (err.reason === 'Validation Error') {
                return res.status(err.code).json(err);
            }
            console.error(err);
            res.status(500).json({ code: 500, message: 'Internal server error' });
        });
});


// ROUTE TO GET ALL USERS
router.get('/', (req, res) => {
    User.find()
        .then(users => res.json(users.map(user => user.apiRepr())));
});

// ROUTE TO FILTER USERS
router.put('/filter', jsonParser, (req, res) => {



    if (req.body.looking_for === 'fill_a_room'){
    User.find({city: req.body.city})
        .where('state').equals(req.body.state)
        .where('max_price').gte(`${req.body.max_price}`)
        .where('looking_for').equals('find_a_room')
        // go through each of the users, calculate algorithm for each user and assign score, then sort the array 
        .then(users => {
            let newCollection = users.map(user => user.apiRepr());
            for (let i = 0; i < newCollection.length; i++ ) {
                console.log(newCollection);
                newCollection[i].score = 'A + B + C + D + E + F + G + H + I';
            }
            newCollection.sort();
            return res.json(newCollection);
        });
    }

    else if (req.body.looking_for === 'find_a_room'){
        User.find({city: req.body.city})
            .where('state').equals(req.body.state)
            .where('max_price').lte(`${req.body.max_price}`)
            .where('looking_for').equals('fill_a_room')
            // go through each of the users, calculate algorithm for each user and assign score, then sort the array 
            .then(users => {
                let newCollection = users.map(user => user.apiRepr());
                for (let i = 0; i < newCollection.length; i++ ) {
                    console.log(newCollection);
                    // newCollection[i].score = 'A + B + C + D + E + F + G + H + I';
                }
                // newCollection.sort();
                return res.json(newCollection);
            });
        }

        else if (req.body.looking_for === 'find_a_roommate'){
            User.find({city: req.body.city})
                .where('state').equals(req.body.state)
                .where('looking_for').equals('find_a_roommate')
                // go through each of the users, calculate algorithm for each user and assign score, then sort the array 
                .then(users => {
                    let newCollection = users.map(user => user.apiRepr());
                    for (let i = 0; i < newCollection.length; i++ ) {
                        console.log(newCollection);
                        // newCollection[i].score = 'A + B + C + D + E + F + G + H + I';
                    }
                    // newCollection.sort();
                    return res.json(newCollection);
                });
            }

});

// ROUTE TO CREATE AND UPDATE USER PROFILE
router.put('/', jsonParser, (req, res) => {
    const requiredFields = ['username'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'Validation Error',
            message: 'Missing field',
            location: missingField
        });
    }

    User.findOne({ username: req.body.username })
        .then(user => {
            if(!user) {
                return res.sendStatus(422)
            }
            console.log("IT GOT HERE")
            let updateStatus = user.firstName ? 'updated' : 'created'; 

            user.firstName = req.body.firstName ? req.body.firstName : null; 
            user.lastName = req.body.firstName ? req.body.firstName : null; 
            user.city = req.body.city ? req.body.city : null; 
            user.state = req.body.state ? req.body.state : null; 
            user.age = req.body.age ? req.body.age : null;
            user.max_distance = req.body.max_distance ? req.body.max_distance : null; 
            user.max_price = req.body.max_price ? req.body.max_price: null; 
            user.pets_have = req.body.pets_have ? req.body.pets_have : null; 
            user.pets_bothered = req.body.pets_bothered ? req.body.pets_bothered : null; 
            user.loud_music = req.body.loud_music ? req.body.loud_music : null; 
            user.loud_music_bothered = req.body.loud_music_bothered ? req.body.loud_music_bothered : null; 
            user.cigarettes = req.body.cigarettes ? req.body.cigarettes : null; 
            user.cigarettes_bothered = req.body.cigarettes_bothered ? req.body.cigarettes_bothered : null; 
            user.drinking_day_per_week = req.body.drinking_day_per_week ? req.body.drinking_day_per_week : null; 
            user.drinking_bothered = req.body.drinking_bothered ? req.body.drinking_bothered : null; 
            user.alt_smoking = req.body.alt_smoking ? req.body.alt_smoking : null; 
            user.alt_smoking_bothered = req.body.alt_smoking_bothered  ? req.body.alt_smoking_bothered  : null; 
            user.hour_awake = req.body.hour_awake ? req.body.hour_awake : null;  
            user.hours_bothered = req.body.hours_bothered ? req.body.hours_bothered : null; 
            user.guest_frequency = req.body.guest_frequency ? req.body.guest_frequency : null; 
            user.guests_bothered = req.body.guests_bothered ? req.body.guests_bothered : null; 
            user.cleanliness = req.body.cleanliness ? req.body.cleanliness : null; 
            user.cleanliness_bothered = req.body.cleanliness_bothered ? req.body.cleanliness_bothered : null; 
            user.gender = req.body.gender ? req.body.gender : null; 
            user.gender_bothered = req.body.gender_bothered ? req.body.gender_bothered : null; 
            user.save(); 

            return res.json({ message: `Your profile was ${updateStatus}`, user: user.apiRepr() }).status(204)
        })
}); 

// ROUTE TO GET SINGLE USER
router.get('/:username', jsonParser, (req, res) => {
    User.findOne({ username: req.params.username })
        .then(user => {
            res.json(user.apiRepr());
        });
});

module.exports = { router }; 