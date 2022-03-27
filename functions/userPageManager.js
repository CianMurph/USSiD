const identity = require('./src/actions/identity')
const utils = require('./src/actions/utilFunctions')
const auth_fns = require('./src/auth');
const crypto = require('./src/crypto');
const Web3 = require('web3');
const web3 = new Web3('https://rpc.l14.lukso.network/');

async function checkSession(fs, db, sessionIdStr, serviceCode, phoneNumber, text, res) {
  console.log('Start of Check Session' + sessionIdStr)
  var sessionRef = db.collection("sessions").doc(sessionIdStr);
  console.log('Here ' + sessionIdStr );
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
          auth_fns.login.signIn(fs, db, 'users', phoneNumber, password, res, sessionIdStr)
          break;

        case 1:
          //Last page was 1 user just prompted to create account
          console.log('Entered Switch Statement Fine')
          text_array = text.split(',');
          uname = text[0]
          passString = text_array[1].replace(' ','');
          password = crypto.encrypt(text_array[1])
          auth_fns.create.createNewAccount(fs, db, 'users', phoneNumber, text_array, password, web3, serviceCode, sessionIdStr, res)

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
              var nextPage = 8;
              break;
            case "5":
              var response = `CON What Type of Claim Would You Like to Stop Presenting:\n`
              var nextPage = 10;
              break;
          }
          response = response + `1. Name
            2. National ID Number
            3. Age
            4. Driver Status
            5. Covid-19 Vaccination Status
            6. Passport`
          utils.updateSession(db, sessionIdStr, nextPage);
          res.set("Content-Type: text/plain");
          res.send(response);

          break;

        case 3:
          //User has just selected to view their existing claims
          text_array = text.split('*');
          var docRef = db.collection("users").doc(phoneNumber);
          docRef.get().then(async function (doc) {
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
                utils.viewClaimsByTopic(db, sessionIdStr, web3, 1, idContract, signer, res)
                break;
              case "2":
                //user wants claims on age
                utils.viewClaimsByTopic(db, sessionIdStr, web3, 2, idContract, signer, res)
                break;
              case "3":
                //user wants claims on nationalId
                utils.viewClaimsByTopic(db, sessionIdStr, web3, 3, idContract, signer, res)
                break;
              case "4":
                //user wants claims on driversLicense
                utils.viewClaimsByTopic(db, sessionIdStr, web3, 4, idContract, signer, res)
                break;
              case "5":
                //user wants claims on Covid Vaccination
                utils.viewClaimsByTopic(db, sessionIdStr, web3, 5, idContract, signer, res)

                break;
              case "6":
                //user wants claims on Passport
                utils.viewClaimsByTopic(db, sessionIdStr, web3, 6, idContract, signer, res)
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
                //utils.selectClaimsToPresent(db, sessionIdStr, web3, topic, idContract, signer, res) 
                utils.selectClaimsToPresent(db, sessionIdStr, web3, 1, idContract, signer, res)
                break;
              case "2":
                //user wants claims on age
                utils.selectClaimsToPresent(db, sessionIdStr, web3, 2, idContract, signer, res)
                break;
              case "3":
                //user wants claims on nationalId
                utils.selectClaimsToPresent(db, sessionIdStr, web3, 3, idContract, signer, res)
                break;
              case "4":
                //user wants claims on driversLicense
                utils.selectClaimsToPresent(db, sessionIdStr, web3, 4, idContract, signer, res)
                break;
              case "5":
                //user wants claims on Covid Vaccination
                utils.selectClaimsToPresent(db, sessionIdStr, web3, 5, idContract, signer, res)

                break;
              case "6":
                //user wants claims on Passport
                utils.selectClaimsToPresent(db, sessionIdStr, web3, 6, idContract, signer, res)
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
            utils.presentClaim(db, sessionIdStr, phoneNumber, web3, claimType, claimIndex, idContract, signer, res)
          })
          break;

          case 6:
            //User has just selected to add claim
            //return list of existing claims within chosen category
            text_array = text.split('*');
            var docRef = db.collection("users").doc(phoneNumber);
            docRef.get().then(async function (doc) {
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
                  //selectClaimsToPresent(db, sessionIdStr, web3, topic, idContract, signer, res) 
                  response = `CON Please Enter First and Second Name Separated by Comma\ne.g. John,Smith`
                  utils.updateSession(db, sessionIdStr, 7);
                  res.set("Content-Type: text/plain");
                  res.send(response);
                  break;
                case "2":
                  //user wants claims on age
                  
                  claimRef = await db.collection("users").doc(phoneNumber).collection('newClaims').doc('NationalID').get()
                  if(!claimRef.exists){
                    response = `END There are no such claims to add\n`
                    utils.deleteSession(db, sessionIdStr);
                    res.set("Content-Type: text/plain");
                    res.send(response);
                    break;
                  }
                  claimData = claimRef.data();
                  receipt = identity.addClaim(web3, 2, 1, claimData.issuer, claimData.signature, claimData.data, claimData.uri, idContract, signer)
                  console.log(`Mined in block ${receipt.blockNumber}`);
                  //db.collection("users").doc(phoneNumber).collection('newClaims').doc('NationalID').delete()
                  utils.deleteSession(db, sessionIdStr);
                  response = `END Claim has been successfully added`;
                  res.set("Content-Type: text/plain");
                  res.send(response);
                  break;
                case "3":
                  //user wants claims on nationalId
                  
                  claimRef = await db.collection("users").doc(phoneNumber).collection('newClaims').doc('NationalID').get()
                  if(!claimRef.exists){
                    response = `END There are no such claims to add\n`
                    utils.deleteSession(db, sessionIdStr);
                    res.set("Content-Type: text/plain");
                    res.send(response);
                    break;
                  }
                  claimData = claimRef.data();
                  receipt = identity.addClaim(web3, 2, 1, claimData.issuer, claimData.signature, claimData.data, claimData.uri, idContract, signer)
                  console.log(`Mined in block ${receipt.blockNumber}`);
                  //db.collection("users").doc(phoneNumber).collection('newClaims').doc('NationalID').delete()
                  utils.deleteSession(db, sessionIdStr);
                  response = `END Claim has been successfully added`;
                  res.set("Content-Type: text/plain");
                  res.send(response);
                  break;
                  
                case "4":
                  //user wants claims on nationalId
                  //user wants claims on age
                  claimRef = await db.collection("users").doc(phoneNumber).collection('newClaims').doc('DrivingLicense').get()
                  if(!claimRef.exists){
                    response = `END There are no such claims to add\n`
                    utils.deleteSession(db, sessionIdStr);
                    res.set("Content-Type: text/plain");
                    res.send(response);
                    break;
                  }
                  claimData = claimRef.data();
                  receipt = identity.addClaim(web3, 2, 1, claimData.issuer, claimData.signature, claimData.data, claimData.uri, idContract, signer)
                  console.log(`Mined in block ${receipt.blockNumber}`);
                  //db.collection("users").doc(phoneNumber).collection('newClaims').doc('DrivingLicense').delete()
                  utils.deleteSession(db, sessionIdStr);
                  response = `END Claim has been successfully added`;
                  res.set("Content-Type: text/plain");
                  res.send(response);
                  break;
                case "5":
                  //user wants claims on Covid Vaccination
                  //user wants claims on driversLicense
                  claimRef = await db.collection("users").doc(phoneNumber).collection('newClaims').doc('CovidVaccine').get()
                  if(!claimRef.exists){
                    response = `END There are no such claims to add\n`
                    utils.deleteSession(db, sessionIdStr);
                    res.set("Content-Type: text/plain");
                    res.send(response);
                    break;
                  }
                  claimData = claimRef.data();
                  receipt = identity.addClaim(web3, 2, 1, claimData.issuer, claimData.signature, claimData.data, claimData.uri, idContract, signer)
                  console.log(`Mined in block ${receipt.blockNumber}`);
                  //db.collection("users").doc(phoneNumber).collection('newClaims').doc('CovidVaccine').delete()
                  utils.deleteSession(db, sessionIdStr);
                  response = `END Claim has been successfully added`;
                  res.set("Content-Type: text/plain");
                  res.send(response);
                  break;
  
                 
                case "6":
                  //user wants claims on Passport
                 //user wants claims on Covid Vaccination
                  //user wants claims on driversLicense
                  claimRef = await db.collection("users").doc(phoneNumber).collection('newClaims').doc('Passport').get()
                  if(!claimRef.exists){
                    response = `END There are no such claims to add\n`
                    utils.deleteSession(db, sessionIdStr);
                    res.set("Content-Type: text/plain");
                    res.send(response);
                    break;
                  }
                  claimData = claimRef.data();
                  receipt = identity.addClaim(web3, 2, 1, claimData.issuer, claimData.signature, claimData.data, claimData.uri, idContract, signer)
                  console.log(`Mined in block ${receipt.blockNumber}`);
                  //db.collection("users").doc(phoneNumber).collection('newClaims').doc('Passport').delete()
                  utils.deleteSession(db, sessionIdStr);
                  response = `END Claim has been successfully added`;
                  res.set("Content-Type: text/plain");
                  res.send(response);
                  break;
              }
            });
  
  
  
            break;
        case 7:
          text_array = text.split('*');
            var docRef = db.collection("users").doc(phoneNumber);
            docRef.get().then(async function (doc) {
              console.log(phoneNumber)
              userData = doc.data();
              web3Account = userData.account;
              idContract = userData.idContractAddress;
              console.log(web3Account)
              web3Account = web3.eth.accounts.decrypt(web3Account, text_array[0])
              console.log(web3Account)
              signer = web3.eth.accounts.privateKeyToAccount(web3Account.privateKey)
              web3.eth.accounts.wallet.add(signer)
              nameArr = text_array[3].split(',');
              firstName = nameArr[0];
              secondName = nameArr[1];
              credentialData = {"Name":firstName,"Surname":secondName};
              credentialData = web3.eth.abi.encodeParameter('string',JSON.stringify(credentialData));
              credentialSig = web3.utils.keccak256(web3.eth.abi.encodeParameters(['address','uint256','bytes'],[signer.address, 1, credentialData]));
              receipt = await identity.addClaim(web3, 1, 4, signer.address, credentialSig, credentialData, '', idContract, signer);
              if(!receipt){
                utils.deleteSession(db, sessionIdStr)
                response = `END Something Went Wrong Claim Not Added`
                res.set("Content-Type: text/plain");
                res.send(response);      
              }
              utils.deleteSession(db, sessionIdStr)
              response = `END Claim Added`
              res.set("Content-Type: text/plain");
              res.send(response);
            })

          break
        case 8:
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
                //selectClaimsToPresent(db, sessionIdStr, web3, topic, idContract, signer, res) 
                utils.selectClaimsToRemove(db, sessionIdStr, web3, 1, idContract, signer, res)
                break;
              case "2":
                //user wants claims on age
                utils.selectClaimsToRemove(db, sessionIdStr, web3, 2, idContract, signer, res)
                break;
              case "3":
                //user wants claims on nationalId
                utils.selectClaimsToRemove(db, sessionIdStr, web3, 3, idContract, signer, res)
                break;
              case "4":
                //user wants claims on driversLicense
                utils.selectClaimsToRemove(db, sessionIdStr, web3, 4, idContract, signer, res)
                break;
              case "5":
                //user wants claims on Covid Vaccination
                utils.selectClaimsToRemove(db, sessionIdStr, web3, 5, idContract, signer, res)

                break;
              case "6":
                //user wants claims on Passport
                utils.selectClaimsToRemove(db, sessionIdStr, web3, 6, idContract, signer, res)
                break;
              
            }
          });
          break;
          case 9:
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
              utils.removeClaim(db, sessionIdStr, phoneNumber, web3, claimType, claimIndex, idContract, signer, res)
            });
          break;
          case 10:
            //Stop presenting cliam of selected type
            text_array = text.split('*');
            claimType = parseInt(text_array[2]);
            var presRef = db.collection("public").doc(phoneNumber).collection("claims").doc(text_array[2]);
            presRef.get().then(function(doc){
              if(doc.exists){
                presData = doc.data().text_array
                presRef.delete().then(() => {
                  console.log("Document successfully deleted!");
                  response = `END Claim ${presData} is no longer being presented`;
                  utils.deleteSession(db, sessionIdStr);
                  res.set("Content-Type: text/plain");
                  res.send(response);
                }).catch((error) => {
                  console.error("Error removing document: ", error);
                });

                
              }
              
            })         


      }
    } else {
      // doc.data() will be undefined in this case
      //This is the first request for this session we must create a session document in the database then ask to login or create account
      console.log(serviceCode)
      console.log('here2' + sessionIdStr)
      utils.checkUserExists(db,'users', phoneNumber, sessionIdStr, res);
    }
  }).catch((error) => {
    console.log("Error getting document:", error);
  });
}




exports.checkSession = checkSession;