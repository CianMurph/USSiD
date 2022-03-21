const identity = require('./src/actions/verifier')
const utils = require('./src/actions/utilFunctions')
const auth_fns = require('./src/auth');
const crypto = require('./src/crypto');
const Web3 = require('web3');
const claimissuer = require('./src/contracts/abi/claimissuer');
const { response } = require('express');
const web3 = new Web3('https://rpc.l14.lukso.network/');

async function checkSession(fs, db, sessionId, serviceCode, phoneNumber, text, res) {
    var sessionRef = db.collection("sessions").doc(sessionId);

    sessionRef.get().then(async function (doc) {
        if (doc.exists) {
            //This means that this is not the first response from this session, we need to determine the page last served and serve the requested page
            var sessionData = doc.data();
            var lastPage = sessionData.page;
            console.log('Verifier last page ' + lastPage);

            switch (lastPage) {
                case 0:
                    //Last page was 0 user just accessed the service they have just been prompted to login
                    console.log('sign in user now');
                    password = crypto.encrypt(text);
                    auth_fns.login.signIn(fs, db, 'verifiers', phoneNumber, password, res, sessionId)
                    break;

                case 1:
                    //Last page was 1 user just prompted to create account
                    text_array = text.split(',');
                    uname = text[0]
                    passString = text_array[1].replace(' ','');
                    password = crypto.encrypt(text_array[1])
                    auth_fns.create.createNewAccount(fs, db, 'verifiers', phoneNumber, text_array, password, web3, serviceCode, sessionId, res)

                    break;
                case 2:
                    //just prompted to enter phone number of claim holder they are inspecting
                    response = `CON What Type of Claim Would You Like to Verify
                    1. Name
                    2. National ID Number
                    3. Age
                    4. Driver Status
                    5. Covid-19 Vaccination Status
                    6. Passport`
                    utils.updateSession(db, sessionId, 3)
                    res.set("Content-Type: text/plain");
                    res.send(response);

                    break;
                case 3:
                    text_array = text.split('*')
                    var docRef = db.collection("verifiers").doc(phoneNumber);
                    doc = await docRef.get()
                    console.log(phoneNumber)
                    userData = doc.data();
                    web3Account = userData.account;
                    idContract = userData.idContractAddress;
                    console.log(web3Account)
                    web3Account = web3.eth.accounts.decrypt(web3Account, text_array[0])
                    console.log(web3Account)
                    signer = web3.eth.accounts.privateKeyToAccount(web3Account.privateKey)
                    web3.eth.accounts.wallet.add(signer)
                    
                   
                    text_array = text.split('*');
                    userPhoneHash = crypto.hash(text_array[1]);
                    console.log('unhashed user number ' + text_array[1])
                    console.log('Hash of user number ' + userPhoneHash);
                    index = parseInt(text[2]) - 1
                    try {
                        claimType = identity.ClaimTypes[index].value;
                    }
                    catch (error) {
                        console.log("Claim Type Doesn't Exist");
                        response = `END Invalid Input`;
                        utils.deleteSession(db, sessionId);
                        res.set("Content-Type: text/plain");
                        res.send(response);
                    }
                    issuerContract = await db.collection('issuers').doc(claimType).get();
                    console.log(issuerContract);
                    issuerContractAddress = issuerContract.data().contractAddress;
                    userRef = db.collection('public').doc(userPhoneHash);
                    console.log(userRef)
                    userClaimRef = await db.collection('public').doc(userPhoneHash).collection('claims').doc(text_array[2]).get()
                    console.log(userClaimRef)
                    if (!userClaimRef.exists) {
                        console.log('No such claim')
                        response = `END The user has not presented any claims of that type`;
                        utils.deleteSession(db, sessionId);
                        res.set("Content-Type: text/plain");
                        res.send(response);
                    }
                    else {
                        userClaim = userClaimRef.data();
                    }
                    userContractRef = await userRef.get();
                    if (!userContractRef.exists) {
                        console.log('No such Contract')
                        response = `END The user has not presented any Contracts of that type`;
                        utils.deleteSession(db, sessionId);
                        res.set("Content-Type: text/plain");
                        res.send(response);
                    }
                    else {
                        userContract = userContractRef.data();
                        userContractAddress = userContract.contractAddress;
                    }
                    console.log({topic:userClaim.topic, sig:userClaim.signature, data:userClaim.data, identity:userContractAddress, sender:signer.address, issuer:issuerContractAddress})
                    vailidity = await identity.checkValidity(web3, userClaim.topic, userClaim.signature, userClaim.data, userContractAddress, signer.address, issuerContractAddress);
                    if(vailidity === true){
                        decodedData = web3.eth.abi.decodeParameter('string', userClaim.data)
                        decodedDataJson = JSON.parse(decodedData);
                        expiry = new Date(decodedDataJson.End)
                        if(expiry < new Date()){
                            response = `END The document expired on decodedDataJson.End`;
                        }
                        else{response = `END Document is valid`;}
                        res.set("Content-Type: text/plain");
                        res.send(response);
                    }
                    else{
                        response = `END Document is not valid!`;
                        res.set("Content-Type: text/plain");
                        res.send(response);
                    }
            }
        }
        else{
        // doc.data() will be undefined in this case
        //This is the first request for this session we must create a session document in the database then ask to login or create account
        utils.checkUserExists(db, 'verifiers', phoneNumber, sessionIdStr, res);
        }

    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}




exports.checkSession = checkSession;