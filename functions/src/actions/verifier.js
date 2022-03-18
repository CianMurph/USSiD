const claimIssuer = require('../contracts/abi/claimissuer')


const KeyPurpose = [
    { id: '1', value: 'Management' },
    { id: '2', value: 'Action' },
    { id: '3', value: 'Claim Signer' },
    { id: '4', value: 'Encryption' }
]

const Schemes = [
    { id: '1', value: 'ECDSA' },
    { id: '2', value: 'RSA' },
    { id: '3', value: 'Contract Call' },
    { id: '4', value: 'Self-Claim' }
]

const ClaimTypes = [
    { id: '1', value: 'Full Name' },
    { id: '2', value: 'Age' },
    { id: '3', value: 'National ID' },
    { id: '4', value: 'Driver Licence' },
    { id: '5', value: 'Covid Vaccine' },
    { id: '6', value: 'Passport' }
]

async function deploy(web3,_initialKey, signer) {

    const contract = new web3.eth.Contract(claimIssuer.abi);
    contract.options.data = claimIssuer.data;
    const deployTx = contract.deploy({ arguments: [_initialKey] });
    const deployedContract = await deployTx
      .send({
        from: signer.address,
        gas: await deployTx.estimateGas(),
      })
      .once("transactionHash", (txhash) => {
        console.log(`Mining deployment transaction ...`);
      });
    // The contract is now deployed on chain!
    console.log(`Contract deployed at ${deployedContract.options.address}`);
    console.log(
      `Add DEMO_CONTRACT to the.env file to store the contract address: ${deployedContract.options.address}`
    );
  }


async function getKey(web3,_key, contractAddress, account) {

    deployedIdContract = new web3.eth.Contract(claimIssuer.abi, contractAddress);
    return await deployedIdContract.methods.getKey(_key).call({from:account});


}


async function getKeyPurposes(web3,_key, contractAddress, account) {
    deployedIdContract = new web3.eth.Contract(claimIssuer.abi, contractAddress);
    return await deployedIdContract.methods.getKeyPurposes(_key).call({from:account});

}

async function getKeysByPurpose(web3,_purpose, contractAddress, account) {
    deployedIdContract = new web3.eth.Contract(claimIssuer.abi, contractAddress);
    return await deployedIdContract.methods.getKeysByPurpose(_purpose).call({from:account});


}

async function addKey(web3, _key, _purpose, _type, contractAddress, signer) {
    deployedIdContract = new web3.eth.Contract(claimIssuer.abi, contractAddress);
    const tx = deployedIdContract.methods.addKey(_key, _purpose, _type);
    const receipt = await tx
      .send({
        from: signer.address,
        gas: 200000,
      })
      .once("transactionHash", (txhash) => {
        console.log(`Mining transaction ...`);
        return txhash;
      });
    // The transaction is now on chain!
    console.log(`Mined in block ${receipt.blockNumber}`);
    console.log(receipt)
    //return deployedContract.options.address;
  }

async function approve(web3,_id, _approve, contractAddress) {
    //approved is called by the smart contract within the execute function
}

async function execute(web3,_to, _value, _data, contractAddress) {

}

async function removeKey(web3,_key, _purpose, contractAddress, signer) {
    deployedIdContract = new web3.eth.Contract(claimIssuer.abi, contractAddress);
    const tx = deployedIdContract.methods.removeKey(_key, _purpose)
    const receipt = await tx
        .send({
            from: signer.address,
            gas: await tx.estimateGas(),
        })
        .once("transactionHash", (txhash) => {
            console.log(`Mining transaction ...`);
            //console.log(`https://${network}.etherscan.io/tx/${txhash}`);
        });
    // The transaction is now on chain!
    console.log(`Mined in block ${receipt.blockNumber}`);


}

async function keyHasPurpose(web3,_key, _purpose, contractAddress, account) {
    deployedIdContract = new web3.eth.Contract(claimIssuer.abi, contractAddress);
    return await deployedIdContract.methods.keyHasPurpose(_key, _purpose).call({from:account});
}

async function addClaim(
    web3,
    topic,
    scheme,
    issuerAddress,
    signature,
    data,
    uri,
    contractAddress,
    signer
) {
    deployedIdContract = new web3.eth.Contract(claimIssuer.abi, contractAddress);
    const tx = deployedIdContract.methods.addClaim(topic, scheme, issuerAddress, signature, data, uri,)
    const receipt = await tx
        .send({
            from: signer.address,
            gas: await tx.estimateGas(),
        })
        .once("transactionHash", (txhash) => {
            console.log(`Mining transaction ...`);
            //console.log(`https://${network}.etherscan.io/tx/${txhash}`);
        });
    // The transaction is now on chain!
    console.log(`Mined in block ${receipt.blockNumber}`);

}

async function removeClaim(web3,_claimId, signer) {
    deployedIdContract = new web3.eth.Contract(claimIssuer.abi, contractAddress);
    const tx = deployedIdContract.methods.removeClaim(_claimId)
    const receipt = await tx
        .send({
            from: signer.address,
            gas: await tx.estimateGas(),
        })
        .once("transactionHash", (txhash) => {
            console.log(`Mining transaction ...`);
            //console.log(`https://${network}.etherscan.io/tx/${txhash}`);
        });
    // The transaction is now on chain!
    console.log(`Mined in block ${receipt.blockNumber}`);
}


async function getClaim(web3,_claimId, account) {
    deployedIdContract = new web3.eth.Contract(claimIssuer.abi, contractAddress);
    return await deployedIdContract.methods.getClaim(_claimId).call({from:account});
}

async function revokeClaim(web3,_claimId, _identity, signer) {
    deployedIdContract = new web3.eth.Contract(claimIssuer.abi, contractAddress);
    const tx = deployedIdContract.methods.revokeClaim(_claimId, _identity)
    const receipt = await tx
        .send({
            from: signer.address,
            gas: await tx.estimateGas(),
        })
        .once("transactionHash", (txhash) => {
            console.log(`Mining transaction ...`);
            //console.log(`https://${network}.etherscan.io/tx/${txhash}`);
        });
    // The transaction is now on chain!
    console.log(`Mined in block ${receipt.blockNumber}`);
}

async function checkValidity(web3,_identity, claimTopic, sig, data, account){
    deployedIdContract = new web3.eth.Contract(claimIssuer.abi, _identity);
    return await deployedIdContract.methods.isClaimValid(_identity, claimTopic, sig, data).call({from:account});
}

async function checkRevocation(web3,sig, account){
    deployedIdContract = new web3.eth.Contract(claimIssuer.abi, contractAddress);
    return await deployedIdContract.methods.isClaimRevoked(sig).call({from:account});
}





module.exports = {
    deploy, getClaim, removeClaim, addClaim, keyHasPurpose, removeKey, execute, 
    approve, addKey, getKeysByPurpose, getKeyPurposes, removeKey, getKey, revokeClaim, 
    checkValidity, checkRevocation
}
