'use strict';

const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const { User } = require('../users/models');
const { JWT_SECRET } = require('../config');

const localStrategy = new LocalStrategy((username, password, callback) => {
    console.log('usernamepassword', username, password);
    let user;
    User.findOne({ username: username })
        .then(_user => {
            user = _user;
            console.log('user1', user);
            if (!user) {
                return Promise.reject({
                    reason: 'Login Error',
                    message: 'Incorrect username or password'
                });
            }
            
            return user.validatePassword(password);
        })
        .then(isValid => {
            console.log('isvalid',isValid);
            if (!isValid) {
                return Promise.reject({
                    reason: 'Login Error',
                    message: 'Incorrect username or password'
                });
            }
            return callback(null, user);
        })
        .catch(err => {
            if (err.reason === 'Login Error') {
                return callback(null, false, err);
            }
            return callback(err, false);
        });
});

const jwtStrategy = new JwtStrategy(
    {
        secretOrKey: JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
        algorithms: ['HS256']
    },
    (payload, done) => {
        done(null, payload.user);
    }
);

module.exports = { localStrategy, jwtStrategy };


