require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT;
const bodyParser = require('body-parser');
const mailchimp = require("@mailchimp/mailchimp_marketing");


app.use(express.static('public'));

app.use(bodyParser.urlencoded({
  extended: true
}));

mailchimp.setConfig({
  apiKey: "995ef073e73bd5475659353d2d730782",
  server: "us10"
});

let subscribingUser = {}; // Define subscribingUser object globally

app.listen(port || 3000, () => {
  console.log('Server Started!!!');
});

app.get('/', (req, res) => {
  res.sendFile (__dirname + '/index.html');
});

app.post('/', async (req, res) => {
  subscribingUser = {
    firstName: req.body.fName,
    lastName: req.body.lName,
    email: req.body.email
  };

  console.log(subscribingUser);

  try {
    await run(); // Call the run() function to add the member to the Mailchimp list
    res.sendFile(__dirname + '/success.html'); // Send a response to the client indicating success
  } catch (error) {
    console.log('Error:', error);
    res.sendFile(__dirname + '/failure.html'); // Send an error response if something goes wrong
  }
});

async function run() {
  try {
    const response = await mailchimp.lists.addListMember('8eefe384be', {
      email_address: subscribingUser.email,
      status: 'subscribed',
      merge_fields: {
        FNAME: subscribingUser.firstName,
        LNAME: subscribingUser.lastName
      }
    });

    console.log(`Successfully added contact as an audience member. The contact's id is ${response.id}.`);
  } catch (error) {
    console.log('Error:', error);
    throw error; // Throw the error to be caught by the caller (app.post() handler)
  }
}

app.post('/failure', (req, res) => {
  res.redirect('/');
});

