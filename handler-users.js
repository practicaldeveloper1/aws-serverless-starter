'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const uuid = require('uuid/v4');
const util = require('./utilityFunctions.js');
const Users = require('./users');
// Create a user, from Cognito
module.exports.createUser = async (event, context) => {

  if (event.request.userAttributes.sub) {
    //we got the use data from Cognito, upon user registration, custom atrributes property starts with word custom:, We save the user in our DynamoDB table
  const user = {
    id: event.request.userAttributes.sub,
    createdAt: new Date().toISOString(),
    email: event.request.userAttributes.email,
    company: event.request.userAttributes['custom:company'],
    contact_person: event.request.userAttributes['custom:contact_person'],
    address: event.request.userAttributes.address,
    phone_number: event.request.userAttributes['custom:phone_number'],
    country: event.request.userAttributes['custom:country'],
    privilege_level: 'USER',
    attributes: event.request.userAttributes
  };

    let users = new Users(db);
    try {
      await users.save(user);
    }
    catch (err) {
      console.log("Error", err);
      return util.response(err.statusCode, err);
    }
    console.log("Success: Everything executed correctly");
    context.done(null, event);
  } else {
    // Nothing to do, the user's ID is unknown
    console.log("Error: Nothing was written to DDB or SQS, Please contact administrator");
    context.done(null, event);
  }
};