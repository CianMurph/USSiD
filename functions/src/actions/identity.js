const identity = require('./../contracts/abi/identity.json');
const Web3 = require('web3');

const web3 = new Web3('https://rpc.l14.lukso.network');

const KeyPurpose = [
    { id: '1', value: 'Management' },
    { id: '2', value: 'Action' },
    { id: '3', value: 'Claim Signer' },
    { id: '4', value: 'Encryption' }
  ]

const Schemes =  [
    { id: '1', value: 'ECDSA' },
    { id: '2', value: 'RSA' },
    { id: '3', value: 'Contract Call' },
    { id: '4', value: 'Self-Claim' }
  ]

  const ClaimTypes = [
    { id: '1', value: 'Full Name' },
    { id: '2', value: 'Age'},
    { id: '3', value: 'National ID'},
    { id: '4', value: 'Driver Licence'},  
    { id: '5', value: 'Covid Vaccine'},
    { id: '6', value: 'Passport'}
  ]

  function deployIdentityContract(initalManagementKey, isLibrary = false){
      abi = identity;
      
  }