import Web3 from 'web3';

const web3 = new Web3();

const myDummyPassword = 'mypassword';



// Here we try to load an already created key from the localstorage
web3.eth.accounts.wallet.load(myDummyPassword)

// If none exists we create a new key
if (!web3.eth.accounts.wallet.length) {
    web3.eth.accounts.wallet.create(1);
    web3.eth.accounts.wallet.save(myDummyPassword);

    // Then we log the address and send test LYX from the L14 faucet here: http://faucet.l14.lukso.network
    console.log('My new key address ', web3.eth.accounts.wallet[0].address);

    // If we already have a key created we display it, with its current balance
} else {
    const myKeyAddress = web3.eth.accounts.wallet[0].address;

    console.log('Loaded existing key address ', myKeyAddress);
    console.log(
        'Balance ',
        web3.utils.fromWei(await web3.eth.getBalance(myKeyAddress), 'ether'),
        'LYXt',
    );
}

    // Stop here if our key is yet created and funded

