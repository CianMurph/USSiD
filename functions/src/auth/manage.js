firebase = require('firebase');

function updateUserName(user, name, ){
    user.updateProfile({
        displayName: name,
      }).then(() => {
        // Update successful
        msg = `Name Updated Successfully.\n Have a nice day ${name}`
        // ...
      }).catch((error) => {
        // An error occurred
        // ...
      });
}

function getUser(){
    const user = firebase.auth().currentUser;
}

function checkUser(){
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          var uid = user.uid;
          // ...
        } else {
          // User is signed out
          // ...
        }
      });
}

exports.updateUserName = updateUserName;
exports.getUser = getUser;
exports.checkUser = checkUser;


