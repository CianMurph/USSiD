const crypto = require('./../crypto');

async function signIn(firebase, db, phone, password, res, sessionId) {
    
    var docRef = db.collection("users").doc(phone);
    var uid = phone;
    var claim = {
        control: true
      };
    return docRef.get().then(function(doc){
        if (doc.exists) {
            //console.log("Document data:", doc.data());
            user_data = doc.data();
            if (crypto.decrypt(password) === crypto.decrypt(user_data.password)){
                console.log('Passwords Match')
                firebase.auth().createCustomToken(uid, true)
                .then(function(customToken) {
                  console.log(customToken)

                  db.collection("sessions").doc(sessionId).set({
                    phone: phoneNumber,
                    token: customToken,
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
                  response = `Signed In: What would you like to do?\n1. View Credentials\n`
                })
                .catch(function(error) {
                  console.log("Error creating custom token:", error);
                });
            }
            else{
                console.log('Incorrect Pin')
                response = "Incorrect Pin Please try again";
                res.set("Content-Type: text/plain");
                res.send(response);
            }
            
        } else {
            // doc.data() will be undefined in this case
                console.log(`Cannot Find User`)
                response = "We could not sign you in right now";
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
