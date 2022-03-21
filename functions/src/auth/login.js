const crypto = require('./../crypto');

async function signIn(firebase, db,  collection, phone, password, res,  sessionId) {

  var docRef = db.collection(collection).doc(phone);
  var uid = phone;
  var claim = {
    control: true
  };
  return docRef.get().then(function (doc) {
    if (doc.exists) {
      //console.log("Document data:", doc.data());
      user_data = doc.data();

      if (crypto.decrypt(password) === crypto.decrypt(user_data.password)) {
        console.log('Passwords Match')
        firebase.auth().createCustomToken(uid)
          .then(function (customToken) {
            console.log(customToken)

            db.collection("sessions").doc(sessionId).set({
              phone: phone,
              token: customToken,
              //conditional page set to 8 if service code for verification
              page: 2
            })
              .then(() => {
                message = "Session Document successfully written!";
                //check if account exists already;
              })
              .catch((error) => {
                message = "Error occured!";
                console.error("Error writing document: ", error);
              });
            if(collection === 'users'){
              response = `CON Signed In: What would you like to do?\n1. View Claims\n2. Present Claim\n3. Add Claim\n 4. Remove Claim\n 5. Stop Presentation`
            }
            else{
              response = `CON Signed In: Please Enter the Claim Holder's Phone Number`
            }
            res.set("Content-Type: text/plain");
            res.send(response);
          })

          .catch(function (error) {
            console.log("Error creating custom token:", error);
          });
      }
      else {
        console.log('Incorrect Pin')
        db.collection("sessions").doc(sessionId).delete().then(() => {
          console.log("Document successfully deleted!");
        }).catch((error) => {
          console.error("Error removing document: ", error);
        });
        response = "END Incorrect Pin Please try again";
        res.set("Content-Type: text/plain");
        res.send(response);
      }
    }

    else {
      // doc.data() will be undefined in this case
      console.log(`Cannot Find User`)
      db.collection("sessions").doc(sessionId).delete().then(() => {
        console.log("Document successfully deleted!");
      }).catch((error) => {
        console.error("Error removing document: ", error);
      });
      response = "END We could not sign you in right now";
      res.set("Content-Type: text/plain");
      res.send(response);
      return
    }
  }).catch((error) => {
    console.log("Error getting document:", error);
  });



}



function signOut(firebase) {
  firebase.auth().signOut().then(() => {
    // Sign-out successful.
  }).catch((error) => {
    // An error happened.
  });

}



exports.signIn = signIn;
exports.signOut = signOut;
