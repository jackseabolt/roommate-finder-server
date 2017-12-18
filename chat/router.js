'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('../users/models');
const router = express.Router();
const jsonParser = bodyParser.json();
const config = require('../config');


router.post('/contact', jsonParser, (req, res) => {
  const api_key = 'key-f97937bb84680705a55914dad0c93217';
  const domain = 'sandboxc1770a2ad14b4f9ba4de9e6ece502492.mailgun.org';
  const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
   
  let data = {
    from: 'Roommate finder <postmaster@sandboxc1770a2ad14b4f9ba4de9e6ece502492.mailgun.org>',
    to: 'jackseabolt@gmail.com',
    subject: `Message from ${req.body.name}`,
    text:  
     `
       You have received a new message from Roommate finder. 

       Name: ${req.body.name}
       Email: ${req.body.email}
       Message:
       ${req.body.message}`
  };
   
  mailgun.messages().send(data, function (error, body) {
    console.log(body);
    if(!error) {
      res.send('Mail Sent');
    }
    else {
      res.send('There was a problem with Mailgun');
    }
  });
});


module.exports = { router }; 


