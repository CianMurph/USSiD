const { response } = require("express");

function createNewAccount(firebase, db, phone, text, password, web3, sessionId, res) {
    var web3Account = web3.eth.accounts.create()
    web3Account = web3.eth.accounts.encrypt(web3Account.privateKey, text[1])
    db.collection("users").doc(phone).set({
        name: text[0],
        password: password,
        acc: web3Account

    })
        .then(() => {
            message = "Document successfully written!";
            //console.log(message);
            var response = `END Account Created Successfully, goodbye for now`;
            //delete session data
            db.collection("sessions").doc(sessionId).delete().then(() => {
                console.log("Document successfully deleted!");
            }).catch((error) => {
                console.error("Error removing document: ", error);
            });
            res.set("Content-Type: text/plain");
            res.send(response);
        })
        .catch((error) => {
            message = "Error occured!";
            console.error("Error writing document: ", error);

        });






}

exports.createNewAccount = createNewAccount;