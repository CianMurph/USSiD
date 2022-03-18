const identity = require('./src/actions/identity')
const auth_fns = require('./src/auth');
const crypto = require('./src/crypto');
const Web3 = require('web3');
const web3 = new Web3('HTTP://127.0.0.1:7545');

async function checkSession(fs, db, sessionId, serviceCode, phoneNumber, text, res) {
  var sessionRef = db.collection("sessions").doc(sessionId);

  sessionRef.get().then(function (doc) {
    if (doc.exists) {
      //This means that this is not the first response from this session, we need to determine the page last served and serve the requested page
      var sessionData = doc.data();
      var lastPage = sessionData.page;
      console.log(lastPage);

      switch (lastPage) {
        case 0:
          //Last page was 0 user just accessed the service they have just been prompted to login
          console.log('sign in user now');
          password = crypto.encrypt(text);
          auth_fns.login.signIn(fs, db, phoneNumber, password, res, sessionId)
          break;

        case 1:
          //Last page was 1 user just prompted to create account
          text_array = text.split(',');
          uname = text[0]
          password = crypto.encrypt(text_array[1])
          auth_fns.create.createNewAccount(fs, db, phoneNumber, text_array, password, web3, serviceCode, sessionId, res)

          break;

        case 2:
          text_array = text.split('*');
          //Check to ensure that the user is logged in
          if (text_array[1] === "1") {
            //user wishes to view claims
            var response = `CON What Type of Claim Would You Like to View\n
            1. Name
            2. National ID Number
            3. Age
            4. Driver Status
            5. Covid-19 Vaccination Status
            6. Passport`
            updateSession(db, sessionId, 3)
            res.set("Content-Type: text/plain");
            res.send(response);

          }
          else if (text_array[1] === "2") {
            //user wishes to make a claim
            var response = `CON Who Would you like to present the claim to (enter phone number)\n
                        1. Name\n
                        2. National ID Number\n
                        3. Age\n
                        4. Driver Status\n
                        5. Covid-19 Vaccination Status\n
                        6. Passport`
            updateSession(db, sessionId, 4)
            res.set("Content-Type: text/plain");
            res.send(response);

          }

          break;

        case 3:
          //User has just selected to view their existing claims
          text_array = text.split('*');
          var docRef = db.collection("users").doc(phoneNumber);
          docRef.get().then(function (doc) {
            console.log(phoneNumber)
            userData = doc.data();
            web3Account = userData.account;
            idContract = userData.idContractAddress;
            console.log(web3Account)
            web3Account = web3.eth.accounts.decrypt(web3Account, text_array[0])
            console.log(web3Account)
            signer = web3.eth.accounts.privateKeyToAccount(web3Account.privateKey)
            web3.eth.accounts.wallet.add(signer)
            switch (text_array[2]) {
              case "1":
                //user wants claims on name
                viewClaimsByTopic(web3, 1, idContract, signer)
                break;
              case "2":
                //user wants claims on age
                viewClaimsByTopic(web3, 2, idContract, signer)
                break;
              case "3":
                //user wants claims on nationalId
                viewClaimsByTopic(web3, 3, idContract, signer)
                break;
              case "4":
                //user wants claims on driversLicense
                viewClaimsByTopic(web3, 4, idContract, signer)
                break;
              case "5":
                //user wants claims on Covid Vaccination
                viewClaimsByTopic(web3, 5, idContract, signer)

                break;
              case "6":
                //user wants claims on Passport
                viewClaimsByTopic(web3, 6, idContract, signer)
                break;
            }
          });
          break;

        case 4:
          var response = `CON What Type of Claim Would You Like to Present\n
            1. Name
            2. National ID Number
            3. Age
            4. Driver Status
            5. Covid-19 Vaccination Status
            6. Passport`
          updateSession(db, sessionId, 5)
          res.set("Content-Type: text/plain");
          res.send(response);



          break;

        case 5:
          //User has just selected to view their existing claims
          text_array = text.split('*');
          var docRef = db.collection("users").doc(phoneNumber);
          docRef.get().then(function (doc) {
            console.log(phoneNumber)
            userData = doc.data();
            web3Account = userData.account;
            idContract = userData.idContractAddress;
            console.log(web3Account)
            web3Account = web3.eth.accounts.decrypt(web3Account, text_array[0])
            console.log(web3Account)
            signer = web3.eth.accounts.privateKeyToAccount(web3Account.privateKey)
            web3.eth.accounts.wallet.add(signer)
            switch (text_array[2]) {
              case "1":
                //user wants claims on name
                selectClaimsToPresent(web3, 1, idContract, signer, db, sessionId, 6)
                break;
              case "2":
                //user wants claims on age
                selectClaimsToPresent(web3, 2, idContract, signer, db, sessionId, 6)
                break;
              case "3":
                //user wants claims on nationalId
                selectClaimsToPresent(web3, 3, idContract, signer, db, sessionId, 6)
                break;
              case "4":
                //user wants claims on driversLicense
                selectClaimsToPresent(web3, 4, idContract, signer, db, sessionId, 6)
                break;
              case "5":
                //user wants claims on Covid Vaccination
                selectClaimsToPresent(web3, 5, idContract, signer, db, sessionId, 6)

                break;
              case "6":
                //user wants claims on Passport
                selectClaimsToPresent(web3, 6, idContract, signer, db, sessionId, 6)
                break;
            }
          });
          break;

        case 6:
          //check received string to determine which claim to get
          //add phoneNumber hash and claimId to list of claimsToCheck on Verifier Account
          break;
      }
    } else {
      // doc.data() will be undefined in this case
      //This is the first request for this session we must create a session document in the database then ask to login or create account
      console.log(serviceCode)
      checkUserExists(db, phoneNumber, sessionId, phoneNumber, res);
    }
  }).catch((error) => {
    console.log("Error getting document:", error);
  });
}

function checkUserExists(db, phone, sessionId, phoneNumber, res) {
  var docRef = db.collection("users").doc(phone);

  return docRef.get().then(function (doc) {
    if (doc.exists) {
      data = doc.data();
      //console.log("Document data:", doc.data());
      console.log("New Session Started!");
      db.collection("sessions").doc(sessionId).set({
        phone: phoneNumber,
        token: null,
        page: 0
      })
        .then(() => {
          message = "Session Document successfully written!";
          //check if account exists already;
        })
        .catch((error) => {
          message = "Error occured!";
          console.error("Error writing document: ", error);
        });
      var response = `CON Welcome Back ${data.name} please enter your pin`;
      res.set("Content-Type: text/plain");
      res.send(response);

    } else {
      // doc.data() will be undefined in this case
      console.log("New Session Started!");
      db.collection("sessions").doc(sessionId).set({
        phone: phoneNumber,
        token: null,
        page: 1
      })
        .then(() => {
          message = "Session Document successfully written!";
          //check if account exists already;
        })
        .catch((error) => {
          message = "Error occured!";
          console.error("Error writing document: ", error);
        });
      var response = `CON Welcome please enter your name followed by your desired pin separated by a comma\ne.g. John, 12345678`;
      res.set("Content-Type: text/plain");
      res.send(response);
      return
    }
  }).catch((error) => {
    console.log("Error getting document:", error);
  });
}


function updateSession(db, sessionId, lastPage) {
  db.collection("sessions").doc(sessionId).set({
    page: lastPage
  })
    .then(() => {
      console.log('Last Page Updated Successfully')
      //check if account exists already;
    })
    .catch((error) => {
      message = "Error occured!";
      console.error("Error writing document: ", error);
    });
}

async function viewClaimsByTopic(web3, topic, idContract, signer) {
  identity.getClaimsByTopic(web3, topic, idContract, signer).then(async function (claims) {
    response = `END`
    if (claims.length == 0) {
      db.collection("sessions").doc(sessionId).delete().then(() => {
        console.log("Document successfully deleted!");
      }).catch((error) => {
        console.error("Error removing document: ", error);
      });
      response = `END There are no claims of this type on your ID`
      res.set("Content-Type: text/plain");
      res.send(response);
    }
    for (i = 0; i < claims.length; i++) {
      claim = await identity.getClaim(web3, claims[i], idContract, signer);
      response = response + `${i + 1}: ${web3.utils.hexToAscii(claim.data)}\n`
      console.log(response)

    }
    db.collection("sessions").doc(sessionId).delete().then(() => {
      console.log("Document successfully deleted!");
    }).catch((error) => {
      console.error("Error removing document: ", error);
    });
    res.set("Content-Type: text/plain");
    res.send(response);
  })
}

async function selectClaimsToPresent(db, web3, topic, idContract, signer) {
  identity.getClaimsByTopic(web3, topic, idContract, signer).then(async function (claims) {
    response = `CON Select The Claim You Wish To Present`
    if (claims.length == 0) {
      db.collection("sessions").doc(sessionId).delete().then(() => {
        console.log("Document successfully deleted!");
      }).catch((error) => {
        console.error("Error removing document: ", error);
      });
      response = `END There are no claims of this type on your ID`
      res.set("Content-Type: text/plain");
      res.send(response)
    }
    for (i = 0; i < claims.length; i++) {
      claim = await identity.getClaim(web3, claims[i], idContract, signer);
      response = response + `${i + 1}: ${web3.utils.hexToAscii(claim.data)}\n`
      console.log(response)
    }
    db.collection("sessions").doc(sessionId).delete().then(() => {
      console.log("Document successfully deleted!");
    }).catch((error) => {
      console.error("Error removing document: ", error);
    });
    res.set("Content-Type: text/plain");
    res.send(response);
  })
}


exports.checkSession = checkSession;