const { updateUserName } = require('./manage');

firebase = require('firebase');


function createNewAccount(phone, password, name) {
    const email = phone + '@email.com'
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in 
            var user = userCredential.user;
            updateUserName(user, name);
            // ...
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            // ..
        });
}

exports.createNewAccount = createNewAccount;