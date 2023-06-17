require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const mailchimp = require("@mailchimp/mailchimp_marketing");

app.use(express.static(__dirname + '/src/public'));

app.use(bodyParser.urlencoded({
  extended: true
}));

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER 
});

let subscribingUser = {};

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/public/index.html');
});

app.post('/', async (req, res) => {
  subscribingUser = {
    firstName: req.body.fName,
    lastName: req.body.lName,
    email: req.body.email
  };

  console.log(subscribingUser);

  try {
    await run();
    res.sendFile(__dirname + '/src/public/success.html');
  } catch (error) {
    console.log('Error:', error);
    res.sendFile(__dirname + '/src/public/failure.html');
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
    throw error;
  }
}

app.post('/failure', (req, res) => {
  res.redirect('/');
});
