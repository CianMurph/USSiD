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
          switch (text_array[1]) {
            case "1":
              var response = `CON What Type of Claim Would You Like to View\n`
              var nextPage = 3;
              break;
            case "2":
              var response = `CON What Type of Claim Would You Like to Present\n`
              var nextPage = 4;
              break;
            case "3":
              var response = `CON What Type of Claim Would You Like to Make\n`
              var nextPage = 6;
              break;
            case "4":
              var response = `CON What Type of Claim Would You Like to Remove\n`
              var nextPage = 7;
              break;
          }
          response = response + `1. Name
            2. National ID Number
            3. Age
            4. Driver Status
            5. Covid-19 Vaccination Status
            6. Passport`
          updateSession(db, sessionId, nextPage);
          res.set("Content-Type: text/plain");
          res.send(response);

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
                viewClaimsByTopic(db, sessionId, web3, 1, idContract, signer, res)
                break;
              case "2":
                //user wants claims on age
                viewClaimsByTopic(db, sessionId, web3, 2, idContract, signer, res)
                break;
              case "3":
                //user wants claims on nationalId
                viewClaimsByTopic(db, sessionId, web3, 3, idContract, signer, res)
                break;
              case "4":
                //user wants claims on driversLicense
                viewClaimsByTopic(db, sessionId, web3, 4, idContract, signer, res)
                break;
              case "5":
                //user wants claims on Covid Vaccination
                viewClaimsByTopic(db, sessionId, web3, 5, idContract, signer, res)

                break;
              case "6":
                //user wants claims on Passport
                viewClaimsByTopic(db, sessionId, web3, 6, idContract, signer, res)
                break;
            }
          });
          break;

        case 4:
          //User has just selected to present claim
          //return list of existing claims within chosen category
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
                //selectClaimsToPresent(db, sessionId, web3, topic, idContract, signer, res) 
                selectClaimsToPresent(db, sessionId, web3, 1, idContract, signer, res)
                break;
              case "2":
                //user wants claims on age
                selectClaimsToPresent(db, sessionId, web3, 2, idContract, signer, res)
                break;
              case "3":
                //user wants claims on nationalId
                selectClaimsToPresent(db, sessionId, web3, 3, idContract, signer, res)
                break;
              case "4":
                //user wants claims on driversLicense
                selectClaimsToPresent(db, sessionId, web3, 4, idContract, signer, res)
                break;
              case "5":
                //user wants claims on Covid Vaccination
                selectClaimsToPresent(db, sessionId, web3, 5, idContract, signer, res)

                break;
              case "6":
                //user wants claims on Passport
                selectClaimsToPresent(db, sessionId, web3, 6, idContract, signer, res)
                break;
            }
          });



          break;

        case 5:
          //list claims within chosen topic and handle input
          //text[0] = pin
          //text[1] = initial choice(present, view etc...)
          //text[2] = choice of claim type
          //text[3] = claim index + 1
          text_array = text.split('*');
          claimType = parseInt(text_array[2]);
          claimIndex = parseInt(text_array[3]) - 1;
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
            presentClaim(db, sessionId, phoneNumber, web3, claimType, claimIndex, idContract, signer, res)
          })





          break;

        case 6:
          /*Wants to make a claim, only allow names as of now, request info*/
          break;
        case 7:
          //same as case 4: User has selected to remove claim, retrieve a list of claims within chosen category
          //text[0] = pin
          //text[1] = initial choice(present, view etc...)
          //text[2] = choice of claim type
          //text[3] = claim index + 1
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
                //selectClaimsToPresent(db, sessionId, web3, topic, idContract, signer, res) 
                selectClaimsToRemove(db, sessionId, web3, 1, idContract, signer, res)
                break;
              case "2":
                //user wants claims on age
                selectClaimsToRemove(db, sessionId, web3, 2, idContract, signer, res)
                break;
              case "3":
                //user wants claims on nationalId
                selectClaimsToRemove(db, sessionId, web3, 3, idContract, signer, res)
                break;
              case "4":
                //user wants claims on driversLicense
                selectClaimsToRemove(db, sessionId, web3, 4, idContract, signer, res)
                break;
              case "5":
                //user wants claims on Covid Vaccination
                selectClaimsToRemove(db, sessionId, web3, 5, idContract, signer, res)

                break;
              case "6":
                //user wants claims on Passport
                selectClaimsToRemove(db, sessionId, web3, 6, idContract, signer, res)
                break;
              
            }
          });
          break;
          case 8:
            //list claims within chosen topic and handle input
            //text[0] = pin
            //text[1] = initial choice(present, view etc...)
            //text[2] = choice of claim type
            //text[3] = claim index + 1
            console.log("HERE!!!!!")
            text_array = text.split('*');
            console.log("NOW HERE!!!!!")
            claimType = parseInt(text_array[2]);
            claimIndex = parseInt(text_array[3]) - 1;
            console.log("NOW NOW HERE!!!!!")
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
              removeClaim(db, sessionId, phoneNumber, web3, claimType, claimIndex, idContract, signer, res)
            });
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

async function viewClaimsByTopic(db, sessionId, web3, topic, idContract, signer, res) {
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

async function selectClaimsToPresent(db, sessionId, web3, topic, idContract, signer, res) {
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
    updateSession(db, sessionId, 5)
    res.set("Content-Type: text/plain");
    res.send(response);
  })
}

async function selectClaimsToRemove(db, sessionId, web3, topic, idContract, signer, res) {
  identity.getClaimsByTopic(web3, topic, idContract, signer).then(async function (claims) {
    response = `CON Select The Claim You Wish To Remove`
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
    updateSession(db, sessionId, 8)
    res.set("Content-Type: text/plain");
    res.send(response);
  })
}

async function presentClaim(db, sessionId, phone, web3, topic, index, idContract, signer, res) {
  var publicRef = db.collection("public").doc(phone)
  claims = await identity.getClaimsByTopic(web3, topic, idContract, signer);
  claimId = claims[index]
  await publicRef.set({
    presentedCliam: claimId
  }).then(() => {
    message = "Document successfully written!";
    //console.log(message);
    var response = `END Claim Ready to Verify`;
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
      db.collection("sessions").doc(sessionId).delete().then(() => {
        console.log("Document successfully deleted!");
      }).catch((error) => {
        console.error("Error removing document: ", error);
      });
    });


}

async function removeClaim(db, sessionId, phone, web3, topic, index, idContract, signer, res) {
  /*
  remove the chosen claim from the users account
  */
  claims = await identity.getClaimsByTopic(web3, topic, idContract, signer);
  claimId = claims[index]
  await identity.removeClaim(web3, claimId, idContract, signer);

}


exports.checkSession = checkSession;