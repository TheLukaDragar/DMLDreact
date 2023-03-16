//opmort ethers and make a wallet and save it 
const ethers = require('ethers');
const fs = require('fs');
const fetch = require('node-fetch');

// const wallet = ethers.Wallet.createRandom();

//use await to make sure it is done before continuing



async function createWallet() {

const pin = "1234";

try {
    console.log('createWallet');
    const mnemonic = ethers.utils.entropyToMnemonic(
        ethers.utils.randomBytes(32)
    )
    console.log('createWallet',"random done");
    const wallet = ethers.Wallet.fromMnemonic(mnemonic)
    const encryptedWallet = await wallet.encrypt(pin, { scrypt: { N: 2 ** 1 } }) //TODO: change N to 2 ** 18

    console.log('createWallet',"saving wallet");
    
    //store in secure store

    let wall = {
        mnemonicPhrase: wallet.mnemonic.phrase,
        keyChainData: { //only used for updating the state
        wallet: encryptedWallet,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase,
        pin: pin} 
    }

    //save to file
    fs.writeFileSync('./ADDDEVICEAPI/wallet.json', JSON.stringify(wall, null, 2));



    } catch (error) {
    return thunkAPI.rejectWithValue(error)
    }

}

async function loadWallet() {
    try {
        console.log('loadWallet');
        //read object fom file
        const wallet = JSON.parse(fs.readFileSync('./ADDDEVICEAPI/wallet.json', 'utf8'));
        console.log('loadWallet', wallet);
        //decrypt wallet

        const signer = new ethers.Wallet(wallet.keyChainData.privateKey);
        console.log('loadWallet', signer.address);

        //get message to sign fromapi https://4gkntp89fl.execute-api.eu-central-1.amazonaws.com/development/
        const url = "https://4gkntp89fl.execute-api.eu-central-1.amazonaws.com/development/auth/wallet-auth-msg"
        const response = await fetch(url);
        const data = await response.json();
        console.log('loadWallet', data);
        const signature = await signer.signMessage(data.message);
        console.log('loadWallet', signature);

        topost = {
            "wallet": signer.address,
            "signature": signature,
            "timestamp": data.timestamp,
            "email": "add_box@gmail.com",
            "username": "add_box_admin"
        }

        const url2 = "https://4gkntp89fl.execute-api.eu-central-1.amazonaws.com/development/auth/login/wallet"
        const response2 = await fetch(url2, {
            method: 'POST',
            body: JSON.stringify(topost),
            headers: { 'Content-Type': 'application/json' }
        });
        const data2 = await response2.json();
        console.log('loadWallet', data2);

        const token = data2.authToken.data
        console.log('token', token);

        //get my data
        const url3 = "https://4gkntp89fl.execute-api.eu-central-1.amazonaws.com/development/users/me"
        const response3 = await fetch(url3, {
            method: 'GET',
            headers: { 'Authorization': token }
        });
        const data3 = await response3.json();
        console.log('my data', data3);










        return wallet;
    } catch (error) {
        console.log('loadWallet', error);
        return null;
    }

}

//createWallet();
loadWallet();


