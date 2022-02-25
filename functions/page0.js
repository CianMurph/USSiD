const { response } = require('express');
const auth_fns = require('./src/auth');
const crypto = require('./src/crypto');
const Web3 = require('web3')
const web3 = new Web3('https://rpc.l14.lukso.network');

function checkSession(fs, db, sessionId, serviceCode, phoneNumber, text, res) {
  var sessionRef = db.collection("sessions").doc(sessionId);

  sessionRef.get().then(function (doc) {
    if (doc.exists) {
      //This means that this is not the first response from this session, we need to determine the page last served and serve the requested page
      var sessionData = doc.data();
      var lastPage = sessionData.page;
      console.log(lastPage);

      switch (lastPage) {
        case 0:
          //Last page was 0 user just accessed the service they have just been prompted to login
          console.log('sign in user now');
          password = crypto.encrypt(text);
          auth_fns.login.signIn(fs, db, phoneNumber, password, res, sessionId)
          break;

        case 1:
          //Last page was 1 user just prompted to create account
          text_array = text.split(',');
          uname = text[0]
          password = crypto.encrypt(text_array[1])
          auth_fns.create.createNewAccount(fs, db, phoneNumber, text_array, password, web3, sessionId, res)        

          break;

        case 2:

          break;

        case 3:

          break;

        case 4:

          break;

        case 5:

          break;

        case 6:

          break;
      }
    } else {
      // doc.data() will be undefined in this case
      //This is the first request for this session we must create a session document in the database then ask to login or create account
      checkUserExists(db, phoneNumber,sessionId,phoneNumber, res);
    }
  }).catch((error) => {
    console.log("Error getting document:", error);
  });
}

function checkUserExists(db, phone,sessionId,phoneNumber, res) {
  var docRef = db.collection("users").doc(phone);

  return docRef.get().then(function (doc) {
    if (doc.exists) {
      data = doc.data();
      //console.log("Document data:", doc.data());
      console.log("New Session Started!");
      db.collection("sessions").doc(sessionId).set({
        phone: phoneNumber,
        token: null,
        page: 0
      })
        .then(() => {
          message = "Session Document successfully written!";
          //check if account exists already;
        })
        .catch((error) => {
          message = "Error occured!";
          console.error("Error writing document: ", error);
        });
      var response = `Welcome Back ${data.name} please enter your pin`;
      res.set("Content-Type: text/plain");
      res.send(response);

    } else {
      // doc.data() will be undefined in this case
      console.log("New Session Started!");
      db.collection("sessions").doc(sessionId).set({
        phone: phoneNumber,
        token: null,
        page: 1
      })
        .then(() => {
          message = "Session Document successfully written!";
          //check if account exists already;
        })
        .catch((error) => {
          message = "Error occured!";
          console.error("Error writing document: ", error);
        });
      var response = `Welcome please enter your name followed by your desired pin separated by a comma\ne.g. John, 12345678`;
      res.set("Content-Type: text/plain");
      res.send(response);
      return
    }
  }).catch((error) => {
    console.log("Error getting document:", error);
  });
}

exports.checkSession = checkSession;