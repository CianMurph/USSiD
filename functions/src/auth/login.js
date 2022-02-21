firebase = require('firebase');

function signIn(phone, password) {
    const email = phone + '@email.com'
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            var user = userCredential.user;
            var uName = user.displayName;
            var uid = user.uid;

            return(user, uName,uid);
            // ...
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;

            return(errorCode, errorMessage);
        });

}

function signOut(){
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
      }).catch((error) => {
        // An error happened.
      });
}



exports.signIn = signIn;
exports.signOut = signOut;
