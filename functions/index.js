const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const app1 = express();
const crypto = require('./src/crypto');
const userPageManager = require('./userPageManager');
const verifierPageManager = require('./verifierPageManager');


const fs = require('firebase-admin');
require('firebase/auth');



const serviceAccount = require('./ussd-test-1bea5-firebase-adminsdk-55hk2-dd6e65f773.json');


fs.initializeApp({
  credential: fs.credential.cert(serviceAccount)
});

const db = fs.firestore();


appInit();
function appInit() {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.post("*", (req, res) => {
    //Read the variables sent via POST from our API
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    const phoneNumberHash = crypto.hash(phoneNumber);
    sessionIdStr = sessionId.toString();
    //TODO Check Database SessionID Collection to see if entry exists corresponding to current session
    userPageManager.checkSession(fs, db, sessionIdStr, serviceCode, phoneNumberHash, text, res)
    
  });
  //
  exports.ussd_user = functions.https.onRequest(app);
}
appInit1();
function appInit1() {
  app1.use(bodyParser.json());
  app1.use(bodyParser.urlencoded({ extended: false }));
  app1.post("*", (req, res) => {
    //Read the variables sent via POST from our API
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    const phoneNumberHash = crypto.hash(phoneNumber);
    sessionIdStr = sessionId.toString();
    //TODO Check Database SessionID Collection to see if entry exists corresponding to current session
    verifierPageManager.checkSession(fs, db, sessionIdStr, serviceCode, phoneNumberHash, text, res)
    
  });
  //
  exports.ussd_verifier = functions.https.onRequest(app1);
}

