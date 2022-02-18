const functions = require("firebase-functions");
const express = require('express');
const bodyParser = require('body-parser');
const res = require("express/lib/response");


const app = express();

const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");



// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA37GaqfxXOfEfat6ddBS4dez8_IpKP2-8",
    authDomain: "ussd-test-1bea5.firebaseapp.com",
    projectId: "ussd-test-1bea5",
    storageBucket: "ussd-test-1bea5.appspot.com",
    messagingSenderId: "74704067790",
    appId: "1:74704067790:web:e1ecdd0ec73411fe9d449f"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

appInit();
function appInit() {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.post("/ussd", (req, res) => {
    //Read the variables sent via POST from our API
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    let response = "";
    let account = "";

    if (text == "") {
      readRec();
      //This is the first request. Note how we start the response with CON
      response = `CON Select an Action below!
              1. Create Account
              2. Read Record
              3. Update Record
              4. Delete Record`;
    } else if (text == "1") {
      //Guide the response to the next data entry Dialogue
      account = createRec();
      response = `END Account Created Successfuly`;
    } else if (text == "2") {
      account = readRec();
      response = `END Action Successful`
    } else if (text == "3") {
      account = updateRec();
      response = `END Record updated Successfully`

    } else if (text == "4") {
      account = deleteRec();
      response = `END Record Deleted Successfully`
    }
    //Send the response back to API
    res.set("Content-Type: text/plain");
    res.send(response);
  });
  //
  exports.ussd = functions.https.onRequest(app);
}
function createRec() {
  // Add a new document/Record in collection "USSD"
  db.collection("ussd")
    .add({
      fullname: "Francis",
      lastname: "Kagai",
      mobile: "078000280",
      amount: "0.00",
    })
    .then((docRef) => {
      console.log("Account Created with ID: ", docRef.id);
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
    return "Record Created Successfully"
}
//Update the record
function updateRec() {
  const docRef = db.collection("ussd").doc("9PNAR2N1pdQ5ByW5T66a");
  return docRef.update({
    mobile:"254733400890",
    amount:"10000"
  })
  .then(() => {
      console.log("Document successfully updated!");
  })
  .catch((error) => {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
  });
}
//Read the Record
function readRec() {
  db.collection("ussd")
  .doc("oKVf56xgbwKJU31MB9z0")
  .get()
  .then((doc)=> {
     if (doc.exists) {
       console.log(doc.data())
     } else {
       console.log("The document does not exist")
     }
  })
  .catch((error)=> {
    console.log("Error", error);
  })
  
}
function deleteRec() {
  db.collection("ussd")
  .doc("mUI4mmNIoWBGP8NM54YT") 
  .delete()
  .then(()=> {
     console.log("Record Deleted Successfully");
  })
  .catch((error) => {
    console.log("Error", error);
  })
}