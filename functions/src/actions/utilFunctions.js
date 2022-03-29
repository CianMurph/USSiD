const identity = require('./identity')

module.exports = {
    checkUserExists, updateSession, viewClaimsByTopic, selectClaimsToPresent, selectClaimsToRemove, presentClaim, removeClaim, deleteSession
}
function checkUserExists(db, collection, phoneNumber, sessionIdStr, res) {
    console.log('Begin Check User Exists' + sessionIdStr)
    const useThis = sessionIdStr;
    var docRef = db.collection(collection).doc(phoneNumber);
    console.log(sessionIdStr)
    //sessionIdStr = sessionIdStr.toString()
    return docRef.get().then(function (doc) {
        if (doc.exists) {
            data = doc.data();
            //console.log("Document data:", doc.data());
            console.log("New Session Started!");
            db.collection("sessions").doc(sessionIdStr).set({
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
            console.log("New Session Started! " + useThis);
            console.log(sessionIdStr)
            db.collection("sessions").doc(sessionIdStr).set({
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
            var response = `CON Welcome please enter your name followed a unique six digit pin separated by a comma\ne.g. John,948140`;
            res.set("Content-Type: text/plain");
            res.send(response);
            return
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}

function updateSession(db, sessionIdStr, lastPage) {
    db.collection("sessions").doc(sessionIdStr).set({
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

async function viewClaimsByTopic(db, sessionIdStr, web3, topic, idContract, signer, res) {
    identity.getClaimsByTopic(web3, topic, idContract, signer).then(async function (claims) {
        response = `END `
        
        if (claims.length == 0) {
            deleteSession(db, sessionIdStr);
            response = `END There are no claims of this type on your ID`
            res.set("Content-Type: text/plain");
            res.send(response);
        }
        else {
            console.log(`Viewing Claims on topic ${topic}\n`)
            console.log(`There are ${claims.length} claims`)
            for (i = 0; i < claims.length; i++) {
                console.log('entering for loop')
                claim = await identity.getClaim(web3, claims[i], idContract, signer);
                claimData = web3.utils.hexToAscii(claim.data)
                if(topic == 1){
                    console.log('Claim is on name')
                    claimData = claimData.replace('{','');
                    claimData = claimData.replace('}','');
                    response = response + `${i + 1}: ${claimData}\n`
                    console.log(response)
                }
                else{
                    console.log('Claim is not on name print docuent number')
                    claimDataJson = JSON.parse(claimData)
                    console.log(claimDataJson)
                    response = response + `${i + 1}: Document ID: ${claimDataJson.DocID}\n`
                    console.log(response)
                }
                

            }
            db.collection("sessions").doc(sessionIdStr).delete().then(() => {
                console.log("Document successfully deleted!");
            }).catch((error) => {
                console.error("Error removing document: ", error);
            });
            console.log(`Sending Response ${response}`);
            console.log(typeof(response))
            res.set("Content-Type: text/plain");
            res.send(response);
        }
    })
}

async function selectClaimsToPresent(db, sessionIdStr, web3, topic, idContract, signer, res) {
    identity.getClaimsByTopic(web3, topic, idContract, signer).then(async function (claims) {
        response = `CON Select The Claim You Wish To Present\n`
        if (claims.length == 0) {
            deleteSession(db, sessionIdStr);

            response = `END There are no claims of this type on your ID`
            res.set("Content-Type: text/plain");
            res.send(response)
        }
        for (i = 0; i < claims.length; i++) {
            console.log('entering for loop')
            claim = await identity.getClaim(web3, claims[i], idContract, signer);
            claimData = web3.utils.hexToAscii(claim.data)
            if(topic == 1){
                console.log('Claim is on name')
                claimData = claimData.replace('{','');
                claimData = claimData.replace('}','');
                response = response + `${i + 1}: ${claimData}\n`
                console.log(response)
            }
            else{
                console.log('Claim is not on name print docuent number')
                claimDataJson = JSON.parse(claimData)
                console.log(claimDataJson)
                response = response + `${i + 1}: Document ID: ${claimDataJson.DocID}\n`
                console.log(response)
            }
            

        }
        updateSession(db, sessionIdStr, 5)
        res.set("Content-Type: text/plain");
        res.send(response);
    })
}

async function selectClaimsToRemove(db, sessionIdStr, web3, topic, idContract, signer, res) {
    identity.getClaimsByTopic(web3, topic, idContract, signer).then(async function (claims) {
        response = `CON Select The Claim You Wish To Remove\n`
        if (claims.length == 0) {
            deleteSession(db, sessionIdStr);

            response = `END There are no claims of this type on your ID`
            res.set("Content-Type: text/plain");
            res.send(response)
        }
        for (i = 0; i < claims.length; i++) {
            console.log('entering for loop')
            claim = await identity.getClaim(web3, claims[i], idContract, signer);
            claimData = web3.utils.hexToAscii(claim.data)
            if(topic == 1){
                console.log('Claim is on name')
                claimData = claimData.replace('{','');
                claimData = claimData.replace('}','');
                response = response + `${i + 1}: ${claimData}\n`
                console.log(response)
            }
            else{
                console.log('Claim is not on name print docuent number')
                claimDataJson = JSON.parse(claimData)
                console.log(claimDataJson)
                response = response + `${i + 1}: Document ID: ${claimDataJson.DocID}\n`
                console.log(response)
            }
            

        }
        updateSession(db, sessionIdStr, 9)
        res.set("Content-Type: text/plain");
        res.send(response);
    })
}

async function presentClaim(db, sessionIdStr, phone, web3, topic, index, idContract, signer, res) {

    claims = await identity.getClaimsByTopic(web3, topic, idContract, signer);
    claimId = claims[index];
    claim = await identity.getClaim(web3, claimId, idContract, signer)
    await db.collection("public").doc(phone).collection('claims').doc(topic.toString()).set({
        id: claimId,
        topic: claim.topic,
        issuerAddress: claim.issuer,
        signature: claim.signature,
        data: claim.data
    }, { merge: true }).then(() => {
        message = "Document successfully written!";
        //console.log(message);
        var response = `END Claim Ready to Verify`;
        //delete session data
        deleteSession(db, sessionIdStr);
        res.set("Content-Type: text/plain");
        res.send(response);
    })
        .catch((error) => {
            message = "Error occured!";
            console.error("Error writing document: ", error);
            deleteSession(db, sessionIdStr);
        });

}

async function removeClaim(db, sessionIdStr, phone, web3, topic, index, idContract, signer, res) {
    /*
    remove the chosen claim from the users account
    */
    claims = await identity.getClaimsByTopic(web3, topic, idContract, signer);
    claimId = claims[index]
    await identity.removeClaim(web3, claimId, idContract, signer);
    db.collection("sessions").doc(sessionIdStr).delete().then(() => {
        console.log("Document successfully deleted!");
    }).catch((error) => {
        console.error("Error removing document: ", error);
    });
    var response = `END Claim Removed`;
    res.set("Content-Type: text/plain");
    res.send(response);

}

function deleteSession(db, sessionIdStr) {
    db.collection("sessions").doc(sessionIdStr).delete().then(() => {
        console.log("Document successfully deleted!");
    }).catch((error) => {
        console.error("Error removing document: ", error);
    });
}