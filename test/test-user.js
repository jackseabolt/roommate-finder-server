'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const {TEST_DATABASE_URL} = require('../config');
const {dbConnect, dbDisconnect} = require('../db-mongoose');
const { app } = require('../index');
const { User } = require('../users');
const { JWT_SECRET } = require('../config');

//Set NODE_ENV to 'test
process.env.NODE_ENV = 'test';

//Clear the console before each run
process.stdout.write('\x1Bc\n');

const expect = chai.expect;
chai.use(chaiHttp);

before(function(){
  return dbConnect(TEST_DATABASE_URL);
});

beforeEach(function () { 
  return User.create({
    username: 'giri', password: 'mypassword', looking_for: 'roommate-finder'
  });
});

after(function(){
  return dbDisconnect();
});

afterEach(function(){
  return User.remove({});
});

const username = 'giri1';
const password = 'mypassword';
const looking_for = 'roommate-finder';

describe('Mocha and Chai', function() {
  it('should be properly setup', function() {
    expect(true).to.be.true;
  });
});

describe('/api/users', function(){
  describe('POST', function(){
    it('Should reject users with missing username', function(){
      return chai
        .request(app)
        .post('/api/users')
        .send({ password })
        .then(() => 
          expect.fail(null, null, 'Request should not succees')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError){
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('Validation Error');
          expect(res.body.message).to.equal('Missing field');
          expect(res.body.location).to.equal('username');
        });
    });

    it('Should reject users with missing password', function(){
      return chai
        .request(app)
        .post('/api/users')
        .send({ username })
        .then(() => 
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError){
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('Validation Error');
          expect(res.body.message).to.equal('Missing field');
          expect(res.body.location).to.equal('password');
        });
    });

    it('Should reject users with non-string username', function(){
      return chai
        .request(app)
        .post('/api/users')
        .send({username: 1234, password, looking_for})
        .then(() => 
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError){
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('Validation Error');
          expect(res.body.message).to.equal('Incorrect field type: expect string');
          expect(res.body.location).to.equal('username');
        });
    });

    it('Should reject users with non-string password', function(){
      return chai
        .request(app)
        .post('/api/users')
        .send({ username, password: 1234, looking_for})
        .then(() => 
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError){
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('Validation Error');
          expect(res.body.message).to.equal('Incorrect field type: expect string');
          expect(res.body.location).to.equal('password');
        });
    });

    it('Should reject users with non-trimmed username', function(){
      return chai
        .request(app)
        .post('/api/users')
        .send({username: ` ${username}`, password, looking_for})
        .then(() => 
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err =>{
          if (err instanceof chai.AssertionError){
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('Validation Error');
          expect(res.body.message).to.equal('Cannot start or end with whitespace');
          expect(res.body.location).to.equal('username');
        });
    });

    it('Should reject users with non-trimmed password', function(){
      return chai
        .request(app)
        .post('/api/users')
        .send({username, password: ` ${password}`, looking_for})
        .then(() => 
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError){
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('Validation Error');
          expect(res.body.message).to.equal('Cannot start or end with whitespace');
          expect(res.body.location).to.equal('password');
        });
    });
    it ('Should reject user with empty username', function(){
      return chai
        .request(app)
        .post('/api/users')
        .send({username: '', password, looking_for})
        .then(() => 
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError){
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('Validation Error');
          expect(res.body.message).to.equal('Must be at least 1 characters long');
          expect(res.body.location).to.equal('username');
        });
    });

    it('Should reject users with password less tha ten characters', function(){
      return chai
        .request(app)
        .post('/api/users')
        .send({username, password: '123456', looking_for})
        .then(() => 
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError){
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('Validation Error');
          expect(res.body.message).to.equal('Must be at least 10 characters long');
          expect(res.body.location).to.equal('password');
        });
    });

    it('Should reject users with password greater than 72 characters',function(){
      return chai
        .request(app)
        .post('/api/users')
        .send({username, password: new Array(73).fill('a').join(''), looking_for})
        .then(() => 
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError){
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('Validation Error');
          expect(res.body.message).to.equal('Must be at most 72 characters long');
          expect(res.body.location).to.equal('password');
        }) ;
    });
    it('Should reject users with duplicate username', function () {
      return User.create({ username, password, looking_for })
        .then(() =>
          chai.request(app)
            .post('/api/users')
            .send({ username, password, looking_for })
        )
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('Validation Error');
          expect(res.body.message).to.equal(
            'Username already taken'
          );
          expect(res.body.location).to.equal('username');
        });
    });

    it('Should create a new user', function(){
      return chai
        .request(app)
        .post('/api/users')
        .send({username, password, looking_for})
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('username', 'looking_for');
          expect(res.body.username).to.equal(username);
          return User.findOne({ username});
        })
        .then(user => {
          expect(user).to.not.be.null;
          return user.validatePassword(password);
        })
        .then(passwordIsCorrect => {
          expect(passwordIsCorrect).to.be.true;
        });
    });
  });
  describe('GET', function(){
    it('Should return all existing users', function(){
      return chai
        .request(app)
        .get('/api/users')
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body.length).to.be.above(0);
          expect(res.body).to.be.an('array');
          res.body.forEach(user => {
            expect(user).to.be.an('object');
            expect(user).to.include.keys('username');
          });
          expect(res).to.be.json;
        })
        .catch(err => {
          if (err instanceof chai.AssertionError){
            throw err;
          }
        }) ;
    });

    it('Should return the requested user', function () {
      let user;
      return User
        .findOne()
        .then(function (_user) {
          user = _user;
          return chai
            .request(app)
            .get(`/api/users/${user.username}`);
        })
        .then(function (res) {
          //console.log('res', res);
          expect(res).to.have.status(200);
          expect(res).to.be.an('object');
          expect(res.body).to.include.keys('username', 'looking_for');
          expect(res.body.username).to.deep.equal(user.username);
          expect(res.body.looking_for).to.deep.equal(user.looking_for);
        });
    });
  });

  describe('PUT', function(){
    it('Should return a filtered users', function () {
      const user1 = {
        age: 45,
        alt_smoking: false,
        alt_smoking_bothered: 2,
        bio: 'I would like to find a roommate who is neat and quiet.',
        cigarettes: false,
        cigarettes_bothered: 1,
        city: 'Oakland',
        cleanliness:  false,
        cleanliness_bothered: 2,
        common_areas: false,
        common_areas_bothered: 2,
        drinking_bothered: 2,
        drinking_day_per_week: false,
        firstName: 'fff',
        gender: 'male',
        gender_bothered: 2,
        guests_bothered: 1,
        guests_frequency: false,
        hours_bothered: 4,
        id: '5a32fadabb12c1001400491a',
        interests: 'Horses, Star Wars',
        lastName: 'fff',
        lat: 39.7701723,
        long: -94.8397698,
        looking_for: 'fill_a_room',
        loud_music: false,
        loud_music_bothered: 4,
        max_price: 100,
        movies: 'Matrix',
        music: 'Metal, The Beatles',
        pets_bothered: 2,
        pets_have: false,
        picture: 'https://res.cloudinary.com/dkksqcvlg/image/upload/v1513297606/vhwm3y4gc41fqi872xyb.jpg',
        state: 'CA',
        tv: 'Dr. Who',
        username: 'bayarea'
      };
      return chai
        .request(app)
        .put('/api/users/filter')
        .send(user1)
        .then(res => {
        //  console.log('res', res);
          expect(res).to.have.status(200);
          expect(res._data.age).to.equal(user1.age);
          expect(res).to.be.an('object');
          expect(res._data.username).to.equal(user1.username);
        })
        .catch(err => {
          if (err instanceof chai.AssertionError){
            throw err;
          }
        }) ;
    });

    it('Should update a user', function () {
      const newUser= {
        age: 45,
        alt_smoking: false,
        alt_smoking_bothered: 2,
        bio: 'I would like to find a roommate who is neat and quiet.'
      };
      let user;
      return User
        .findOne()
        .then(function (_user) {
          user = _user;
          newUser.username = user.username;
          return chai
            .request(app)
            .put('/api/users')
            .send(newUser);
        })
        .then(function(res) {
          console.log('res', res);
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal('Your profile was created');
          expect(res.body.user.age).to.equal(newUser.age);
          expect(res.body.user.bio).to.equal(newUser.bio);
        });
    });
  });
});










