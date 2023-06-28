const ethers = require('ethers');

//load demomclient wallet from private key



async function main() {
const wallet = new ethers.Wallet("0x6a3c63737cd800c0367abfb24d6f845de550907257ef1e3786583534c1440d1f");

//sign message
const message = 'DLDM test message';
const signature = await wallet.signMessage(message);

console.log(signature);

}

main();
