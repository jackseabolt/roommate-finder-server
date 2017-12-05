'use strict'; 

const express = require('express'); 
const bodyParser = require('body-parser'); 
const { User } = require('./models'); 
const router = express.Router(); 
const jsonParser = bodyParser.json(); 


// ROUTE TO CREATE USERS INITIALLY
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['firstName', 'lastName', 'username', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'Validation Error',
            message: 'Missing field',
            location: missingField
        });
    }

    const stringFields = ['firstName', 'lastName', 'username', 'password'];
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

    const explicityTrimmedFields = ['firstName', 'lastName', 'username', 'password'];
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
        firstName: { min: 1 },
        lastName: { min: 1 },
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

    let { firstName, lastName, username, password } = req.body;
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
            console.log(data);
            return User.create({ firstName, lastName, username, password: data });
        })
        .then(user => {
            console.log('user:', user);
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


module.exports = { router }; 