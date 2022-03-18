const { response } = require("express");
const crypto = require('../crypto')
const fs = require('fs');
const path = require('path');
const accountsPath = path.resolve(__dirname,'..','contracts','storage','ganAccounts.json')
const accounts = require('../contracts/storage/ganAccounts.json')
const identity = require("../actions/identity")

function createNewAccount(firebase, db, phone, text, password, web3, serviceCode, sessionId, res) {
    const userWall = web3.eth.accounts.wallet.create();
    ganAccounts = accounts;
    for(let i = 0; i <= ganAccounts.length; i ++){
        if(ganAccounts[i].taken == false){
          acc = ganAccounts[i]
          ganAccounts[i].taken = true;
          fs.writeFileSync(accountsPath, JSON.stringify(ganAccounts));
          break
        }
      }

    //web3Account = web3.eth.accounts.encrypt(web3Account.privateKey, text[1]);
    signer = web3.eth.accounts.privateKeyToAccount(acc.privateKey)
    web3.eth.accounts.wallet.add(signer);
    web3Account = web3.eth.accounts.encrypt(signer.privateKey, text[1]);
    idContract = identity.deploy(web3, signer.address, false, web3Account);

    //Create instance in public collection also
    idContract.then(function(contractAddress){
        db.collection("users").doc(phone).set({
            name: text[0],
            password: password,
            account: web3Account,
            idContractAddress: contractAddress
    
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
    })
    .catch((error) => {
        message = "Error occured!";
        console.error("Error writing document: ", error);

    });
    






}

exports.createNewAccount = createNewAccount;