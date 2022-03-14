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
          auth_fns.create.createNewAccount(fs, db, phoneNumber, text_array, password, web3, serviceCode, sessionId, res)

          break;

        case 2:
          text_array = text.split('*');
          //Check to ensure that the user is logged in
          if (text_array[1] === "1") {
            //user wishes to view claims
            db.collection("sessions").doc(sessionId).delete().then(() => {
              console.log("Document successfully deleted!");
            }).catch((error) => {
              console.error("Error removing document: ", error);
            });
            response = "END You Currently Have No Validated Claims"
            res.set("Content-Type: text/plain");
            res.send(response);
          }
          else if (text_array[1] === "2") {
            //user wishes to make a claim
            var response = `CON What Claim Would You Like to Make\n
                        1. National ID Number
                        2. Age
                        3. Driver Status
                        4. Covid-19 Vaccination Status`
            updateSession(db, sessionId, 5)
            res.set("Content-Type: text/plain");
            res.send(response);

          }

          break;

        case 3:

          break;

        case 4:

          break;

        case 5:
          db.collection("sessions").doc(sessionId).delete().then(() => {
            console.log("Document successfully deleted!");
          }).catch((error) => {
            console.error("Error removing document: ", error);
          });
          response = "END WIP"
          res.set("Content-Type: text/plain");
          res.send(response);          

          break;

        case 6:

          break;
      }
    } else {
      // doc.data() will be undefined in this case
      //This is the first request for this session we must create a session document in the database then ask to login or create account
      console.log(serviceCode)
      checkUserExists(db, phoneNumber, sessionId, phoneNumber, res);
    }
  }).catch((error) => {
    console.log("Error getting document:", error);
  });
}

function checkUserExists(db, phone, sessionId, phoneNumber, res) {
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
      var response = `CON Welcome Back ${data.name} please enter your pin`;
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
      var response = `CON Welcome please enter your name followed by your desired pin separated by a comma\ne.g. John, 12345678`;
      res.set("Content-Type: text/plain");
      res.send(response);
      return
    }
  }).catch((error) => {
    console.log("Error getting document:", error);
  });
}


function updateSession(db, sessionId, lastPage) {
  db.collection("sessions").doc(sessionId).set({
    page: lastPage
  })
    .then(() => {
      console.log('Last Page Updated Successfully')
      //check if account exists already;
    })
    .catch((error) => {
      message = "Error occured!";
      console.error("Error writing document: ", error);
    });
}

exports.checkSession = checkSession;