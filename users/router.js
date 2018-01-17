'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('./models');
const router = express.Router();
const jsonParser = bodyParser.json();
const cloudinary = require('cloudinary');
const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', { session: false });

// ROUTE TO CREATE USERS INITIALLY
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['username', 'password', 'looking_for', 'email'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'Validation Error',
            message: 'Missing field',
            location: missingField
        });
    }

    const stringFields = ['username', 'password', 'email'];
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

    const explicityTrimmedFields = ['username', 'password', 'email'];
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

    let { username, password, looking_for, email } = req.body;
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
            return User.create({ username, password: data, looking_for, email });
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
    if (req.body.looking_for === 'fill_a_room') {
        User.find({ city: req.body.city })
            .where('state').equals(req.body.state)
            .where('max_price').gte(req.body.max_price)
            .where('looking_for').equals('find_a_room')
            // go through each of the users, calculate algorithm for each user and assign score, then sort the array 
            .then(users => {
                let newCollection = users.map(user => user.apiRepr());
                for (let i = 0; i < newCollection.length; i++) {
                    let petScore = 100;
                    let quietScore = 100;
                    let cigaretteScore = 100;
                    let alcoholScore = 100;
                    let marijuanaScore = 100;
                    let scheduleScore = 100;
                    let guestScore = 100;
                    let cleanScore = 100;
                    let aloneScore = 100;
                    let genderScore = 100;
                    if (newCollection[i].pets_have === true) {
                        petScore = (100 - (req.body.pets_bothered * 20));
                    }
                    if (newCollection[i].loud_music === true) {
                        quietScore = (100 - (req.body.loud_music_bothered * 20));
                    }
                    if (newCollection[i].cigarettes === true) {
                        cigaretteScore = (100 - (req.body.cigarettes_bothered * 20));
                    }
                    if (newCollection[i].drinking_day_per_week === true) {
                        alcoholScore = (100 - (req.body.drinking_bothered * 20));
                    }
                    if (newCollection[i].alt_smoking === true) {
                        marijuanaScore = (100 - (req.body.alt_smoking_bothered * 20));
                    }
                    if (newCollection[i].hour_awake === true) {
                        scheduleScore = (100 - (req.body.hours_bothered * 20));
                    }
                    if (newCollection[i].guests_frequency === true) {
                        guestScore = (100 - (req.body.guests_bothered * 20));
                    }
                    if (newCollection[i].cleanliness === true) {
                        cleanScore = (100 - (req.body.cleanliness_bothered * 20));
                    }
                    if (newCollection[i].common_areas === true) {
                        aloneScore = (100 - (req.body.common_areas_bothered * 20));
                    }
                    if (newCollection[i].gender === true) {
                        genderScore = (100 - (req.body.gender_bothered * 20));
                    }
                    newCollection[i].score = (petScore + quietScore + cigaretteScore + alcoholScore + marijuanaScore + scheduleScore + guestScore + cleanScore + aloneScore + genderScore) / 10;


                }
                newCollection.sort(function (a, b) {
                    return b.score - a.score;
                });
                return res.json(newCollection);
            });
    }

    else if (req.body.looking_for === 'find_a_room') {
        User.find({ city: req.body.city })
            .where('state').equals(req.body.state)
            .where('max_price').lte(req.body.max_price)
            .where('looking_for').equals('fill_a_room')
            // go through each of the users, calculate algorithm for each user and assign score, then sort the array 
            .then(users => {
                let newCollection = users.map(user => user.apiRepr());
                for (let i = 0; i < newCollection.length; i++) {
                    let petScore = 100;
                    let quietScore = 100;
                    let cigaretteScore = 100;
                    let alcoholScore = 100;
                    let marijuanaScore = 100;
                    let scheduleScore = 100;
                    let guestScore = 100;
                    let cleanScore = 100;
                    let aloneScore = 100;
                    let genderScore = 100;
                    if (newCollection[i].pets_have === true) {
                        petScore = (100 - (req.body.pets_bothered * 20));
                    }
                    if (newCollection[i].loud_music === true) {
                        quietScore = (100 - (req.body.loud_music_bothered * 20));
                    }
                    if (newCollection[i].cigarettes === true) {
                        cigaretteScore = (100 - (req.body.cigarettes_bothered * 20));
                    }
                    if (newCollection[i].drinking_day_per_week === true) {
                        alcoholScore = (100 - (req.body.drinking_bothered * 20));
                    }
                    if (newCollection[i].alt_smoking === true) {
                        marijuanaScore = (100 - (req.body.alt_smoking_bothered * 20));
                    }
                    if (newCollection[i].hour_awake === true) {
                        scheduleScore = (100 - (req.body.hours_bothered * 20));
                    }
                    if (newCollection[i].guests_frequency === true) {
                        guestScore = (100 - (req.body.guests_bothered * 20));
                    }
                    if (newCollection[i].cleanliness === true) {
                        cleanScore = (100 - (req.body.cleanliness_bothered * 20));
                    }
                    if (newCollection[i].common_areas === true) {
                        aloneScore = (100 - (req.body.common_areas_bothered * 20));
                    }
                    if (newCollection[i].gender === true) {
                        genderScore = (100 - (req.body.gender_bothered * 20));
                    }
                    newCollection[i].score = (petScore + quietScore + cigaretteScore + alcoholScore + marijuanaScore + scheduleScore + guestScore + cleanScore + aloneScore + genderScore) / 10;

                }
                newCollection.sort(function (a, b) {
                    return b.score - a.score;
                });
                return res.json(newCollection);
            });
    }

    else if (req.body.looking_for === 'find_a_roommate') {
        User.find({ city: req.body.city })
            .where('state').equals(req.body.state)
            .where('looking_for').equals('find_a_roommate')
            // go through each of the users, calculate algorithm for each user and assign score, then sort the array 
            .then(users => {
                let newCollection = users.map(user => user.apiRepr());
                for (let i = 0; i < newCollection.length; i++) {
                    let petScore = 100;
                    let quietScore = 100;
                    let cigaretteScore = 100;
                    let alcoholScore = 100;
                    let marijuanaScore = 100;
                    let scheduleScore = 100;
                    let guestScore = 100;
                    let cleanScore = 100;
                    let aloneScore = 100;
                    let genderScore = 100;
                    if (newCollection[i].pets_have === true) {
                        petScore = (100 - (req.body.pets_bothered * 20));
                    }
                    if (newCollection[i].loud_music === true) {
                        quietScore = (100 - (req.body.loud_music_bothered * 20));
                    }
                    if (newCollection[i].cigarettes === true) {
                        cigaretteScore = (100 - (req.body.cigarettes_bothered * 20));
                    }
                    if (newCollection[i].drinking_day_per_week === true) {
                        alcoholScore = (100 - (req.body.drinking_bothered * 20));
                    }
                    if (newCollection[i].alt_smoking === true) {
                        marijuanaScore = (100 - (req.body.alt_smoking_bothered * 20));
                    }
                    if (newCollection[i].hour_awake === true) {
                        scheduleScore = (100 - (req.body.hours_bothered * 20));
                    }
                    if (newCollection[i].guests_frequency === true) {
                        guestScore = (100 - (req.body.guests_bothered * 20));
                    }
                    if (newCollection[i].cleanliness === true) {
                        cleanScore = (100 - (req.body.cleanliness_bothered * 20));
                    }
                    if (newCollection[i].common_areas === true) {
                        aloneScore = (100 - (req.body.common_areas_bothered * 20));
                    }
                    if (newCollection[i].gender === true) {
                        genderScore = (100 - (req.body.gender_bothered * 20));
                    }
                    newCollection[i].score = (petScore + quietScore + cigaretteScore + alcoholScore + marijuanaScore + scheduleScore + guestScore + cleanScore + aloneScore + genderScore) / 10;

                }
                newCollection.sort(function (a, b) {
                    return b.score - a.score;
                });
                return res.json(newCollection);
            });
    }
});


// ROUTE TO CREATE AND UPDATE USER PROFILE
router.put('/', jsonParser, jwtAuth, (req, res) => {
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
    User.findOne({ username: req.user.username })
        .then(user => {
            if (!user) {

                return res.sendStatus(422)
            }
            let updateStatus = user.firstName ? 'updated' : 'created';


            cloudinary.uploader.upload(req.body.picture,
            function(result) { console.log("CLOUDINARY", result) })

            user.firstName = req.body.firstName ? req.body.firstName : user.firstName;
            user.lastName = req.body.lastName ? req.body.lastName : user.lastName;
            user.city = req.body.city ? req.body.city : user.city;
            user.state = req.body.state ? req.body.state : user.state;
            user.age = req.body.age ? req.body.age : user.age;
            user.max_distance = req.body.max_distance ? req.body.max_distance : user.max_distance;
            user.max_price = req.body.max_price ? req.body.max_price : user.max_price;
            user.pets_have = req.body.pets_have ? req.body.pets_have : user.pets_have;
            user.pets_bothered = req.body.pets_bothered ? req.body.pets_bothered : user.pets_bothered;
            user.loud_music = req.body.loud_music ? req.body.loud_music : user.loud_music;
            user.loud_music_bothered = req.body.loud_music_bothered ? req.body.loud_music_bothered : user.loud_music_bothered;
            user.cigarettes = req.body.cigarettes ? req.body.cigarettes : user.cigarettes;
            user.cigarettes_bothered = req.body.cigarettes_bothered ? req.body.cigarettes_bothered : user.cigarettes_bothered;
            user.drinking_day_per_week = req.body.drinking_day_per_week ? req.body.drinking_day_per_week : user.drinking_day_per_week;
            user.drinking_bothered = req.body.drinking_bothered ? req.body.drinking_bothered : user.drinking_bothered;
            user.alt_smoking = req.body.alt_smoking ? req.body.alt_smoking : user.alt_smoking;
            user.alt_smoking_bothered = req.body.alt_smoking_bothered ? req.body.alt_smoking_bothered : user.alt_smoking_bothered;
            user.hour_awake = req.body.hour_awake ? req.body.hour_awake : user.hour_awake;
            user.hours_bothered = req.body.hours_bothered ? req.body.hours_bothered : user.hours_bothered;
            user.guests_frequency = req.body.guests_frequency ? req.body.guests_frequency : user.guests_frequency;
            user.guests_bothered = req.body.guests_bothered ? req.body.guests_bothered : user.guests_bothered;
            user.common_areas = req.body.common_areas ? req.body.common_areas : user.common_areas;
            user.common_areas_bothered = req.body.common_areas_bothered ? req.body.common_areas_bothered : user.common_areas_bothered;
            user.cleanliness = req.body.cleanliness ? req.body.cleanliness : user.cleanliness;
            user.cleanliness_bothered = req.body.cleanliness_bothered ? req.body.cleanliness_bothered : user.cleanliness_bothered;
            user.gender = req.body.gender ? req.body.gender : user.gender;
            user.gender_bothered = req.body.gender_bothered ? req.body.gender_bothered : user.gender_bothered;
            user.bio = req.body.bio ? req.body.bio : user.bio;
            user.interests = req.body.interests ? req.body.interests : user.interests;
            user.music = req.body.music ? req.body.music : user.music;
            user.movies = req.body.movies ? req.body.movies : user.movies;
            user.tv = req.body.tv ? req.body.tv : user.tv;
            user.picture = req.body.picture ? req.body.picture : user.picture; 
            user.lat = req.body.lat ? req.body.lat : user.lat;
            user.long = req.body.long ? req.body.long : user.long;
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