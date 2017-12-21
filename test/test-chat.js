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