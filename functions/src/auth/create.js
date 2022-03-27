const crypto = require('../crypto')
const fs = require('fs');
const path = require('path');
const accountsPath = path.resolve(__dirname, '..', 'contracts', 'storage', 'luxAccounts.json')
const accounts = require('../contracts/storage/luxAccounts.json')
const identity = require("../actions/identity")

async function createNewAccount(firebase, db, collection, phone, text, password, web3, serviceCode, sessionId, res) {
    const userWall = web3.eth.accounts.wallet.create();
    console.log('started creating account ok')

    const accountsRef = db.collection('accounts');
    const snapshot = await accountsRef.get();
    snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
      });

    luxAccounts = fs.readFile(accountsPath, 'utf8', (err, data) => {
        if (err) {
            console.log(`Error reading file from disk: ${err}`);
        } else {
            luxAccounts = JSON.parse(data)
            if(luxAccounts){console.log('retrieved list of accounts successfully')}

            for (let i = 0; i <= luxAccounts.length; i++) {
                if (luxAccounts[i].taken == false) {
                    console.log('found unused account ' + i.toString())
                    acc = luxAccounts[i]
                    luxAccounts[i].taken = true;
                    console.log('about to write')
                    //fs.writeFileSync(accountsPath, JSON.stringify(accounts));
                    break
                }
            }

            //web3Account = web3.eth.accounts.encrypt(web3Account.privateKey, text[1]);
            signer = web3.eth.accounts.privateKeyToAccount(acc.privateKey)
            web3.eth.accounts.wallet.add(signer);
            console.log(`Outside Function ${signer.address}`)

            web3Account = web3.eth.accounts.encrypt(signer.privateKey, text[1]);
            idContract = identity.deploy(web3, signer.address, false, signer);

            //Create instance in public collection also
            idContract.then(function (contractAddress) {
                db.collection('public').doc(phone).set({
                    idContractAddress: contractAddress
                }).then(() => {
                    message = "Document successfully written!";
                })
                    .catch((error) => {
                        message = "Error occured!";
                        console.error("Error writing document: ", error);

                    });
                db.collection(collection).doc(phone).set({
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
    });









}

exports.createNewAccount = createNewAccount;