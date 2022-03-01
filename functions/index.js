const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const auth = require('./src/auth');
const crypto = require('./src/crypto');
const pageManager = require('./page0');



const fs = require('firebase-admin');
require('firebase/auth');



const serviceAccount = require('./ussd-test-1bea5-firebase-adminsdk-55hk2-dd6e65f773.json');
const req = require("express/lib/request");
const { response } = require("express");

fs.initializeApp({
  credential: fs.credential.cert(serviceAccount)
});

const db = fs.firestore();


appInit();
function appInit() {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.post("/ussd_crud", (req, res) => {
    //Read the variables sent via POST from our API
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    const phoneNumberHash = crypto.hash(phoneNumber);
    sessionIdStr = sessionId.toString();
    //TODO Check Database SessionID Collection to see if entry exists corresponding to current session
    pageManager.checkSession(fs, db, sessionIdStr, serviceCode, phoneNumberHash, text, res)
    
  });
  //
  exports.ussd_crud = functions.https.onRequest(app);
}

