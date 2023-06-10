import "@ethersproject/shims";
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import "react-native-get-random-values";
import { RootState } from './store';


import Constants from 'expo-constants';
import { ethers } from "ethers";
//import dataserRegistryABI from '../contracts/DatasetRegistry.json';
import DatasetRegistry from './iexec/DatasetRegistry';
import { getAddress } from "ethers/lib/utils";


const RPCUrl = Constants?.expoConfig?.extra?.RPCUrl;
const reputationSCAddress = Constants?.expoConfig?.extra?.reputationSCAddress;
const parcelNFTSCAddress = Constants?.expoConfig?.extra?.parcelNFTSCAddress;
const provider = new ethers.providers.JsonRpcProvider(RPCUrl);

console.log(RPCUrl);
console.log(reputationSCAddress);
console.log(parcelNFTSCAddress);

// Setup provider and contract outside of the slice
// const provider = new ethers.providers.JsonRpcProvider(RPCUrl);
// const contractAddress = '0x3623a0e70040859aa3eb8f63eec65d04efcfdf18';
// const abi = [
//     "function balanceOf(address account) external view returns (uint256)",
//     "function totalSupply() external view returns (uint256)",
// ];
const parcelNFTSC_ABI=[{"type":"constructor","inputs":[{"type":"string","name":"_name","internalType":"string"},{"type":"string","name":"_symbol","internalType":"string"},{"type":"string","name":"_newBaseURI","internalType":"string"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"approve","inputs":[{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"tokenId","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"balanceOf","inputs":[{"type":"address","name":"owner","internalType":"address"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"string","name":"","internalType":"string"}],"name":"baseUri","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"string","name":"parcelId","internalType":"string"},{"type":"address","name":"sender","internalType":"address"},{"type":"address","name":"receiver","internalType":"address"}],"name":"boxes","inputs":[{"type":"uint256","name":"","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"getApproved","inputs":[{"type":"uint256","name":"tokenId","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"address[]","name":"","internalType":"address[]"}],"name":"getBoxDatasets","inputs":[{"type":"string","name":"_uuid","internalType":"string"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"getIdFromUUID","inputs":[{"type":"string","name":"_uuid","internalType":"string"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"string","name":"","internalType":"string"}],"name":"getParcelId","inputs":[{"type":"string","name":"_uuid","internalType":"string"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"isApprovedForAll","inputs":[{"type":"address","name":"owner","internalType":"address"},{"type":"address","name":"operator","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"mint","inputs":[{"type":"address","name":"_receiver","internalType":"address"},{"type":"string","name":"_uuid","internalType":"string"},{"type":"string","name":"_parcelId","internalType":"string"},{"type":"address","name":"_dataset","internalType":"address"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"string","name":"","internalType":"string"}],"name":"name","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"owner","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"ownerOf","inputs":[{"type":"uint256","name":"tokenId","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"renounceOwnership","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"safeTransferFrom","inputs":[{"type":"address","name":"from","internalType":"address"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"tokenId","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"safeTransferFrom","inputs":[{"type":"address","name":"from","internalType":"address"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"tokenId","internalType":"uint256"},{"type":"bytes","name":"data","internalType":"bytes"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"setApprovalForAll","inputs":[{"type":"address","name":"operator","internalType":"address"},{"type":"bool","name":"approved","internalType":"bool"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"setBaseURI","inputs":[{"type":"string","name":"_newBaseURI","internalType":"string"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"supportsInterface","inputs":[{"type":"bytes4","name":"interfaceId","internalType":"bytes4"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"string","name":"","internalType":"string"}],"name":"symbol","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"string","name":"","internalType":"string"}],"name":"tokenURI","inputs":[{"type":"uint256","name":"tokenId","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"transferFrom","inputs":[{"type":"address","name":"from","internalType":"address"},{"type":"address","name":"to","internalType":"address"},{"type":"uint256","name":"tokenId","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"transferOwnership","inputs":[{"type":"address","name":"newOwner","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"updateBox","inputs":[{"type":"string","name":"_uuid","internalType":"string"},{"type":"address","name":"_dataset","internalType":"address"},{"type":"bool","name":"_transferOwnershipToReceiver","internalType":"bool"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"whitelist","inputs":[{"type":"address","name":"","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"whitelistAddresses","inputs":[{"type":"address[]","name":"_list","internalType":"address[]"},{"type":"bool","name":"_whitelist","internalType":"bool"}]},{"type":"event","name":"Approval","inputs":[{"type":"address","name":"owner","indexed":true},{"type":"address","name":"approved","indexed":true},{"type":"uint256","name":"tokenId","indexed":true}],"anonymous":false},{"type":"event","name":"ApprovalForAll","inputs":[{"type":"address","name":"owner","indexed":true},{"type":"address","name":"operator","indexed":true},{"type":"bool","name":"approved","indexed":false}],"anonymous":false},{"type":"event","name":"OwnershipTransferred","inputs":[{"type":"address","name":"previousOwner","indexed":true},{"type":"address","name":"newOwner","indexed":true}],"anonymous":false},{"type":"event","name":"Transfer","inputs":[{"type":"address","name":"from","indexed":true},{"type":"address","name":"to","indexed":true},{"type":"uint256","name":"tokenId","indexed":true}],"anonymous":false}]
const DatasetABI = DatasetRegistry.abi;
//isWhitelisted
export const isWhitelisted = createAsyncThunk(
    'blockchain/isWhitelisted',
    async (_, thunkAPI) => {
        try {
            // Get the current state
            const state = thunkAPI.getState() as RootState;

            // Get the wallet from the state
            const privateKey = state.blockchain.privateKey;

            // Check if the wallet exists
            if (!privateKey) {
                throw new Error("Wallet not found");
            }


            // Create a new wallet instance
            const wallet = new ethers.Wallet(privateKey, provider);

            // Create a new contract instance using the wallet
            const contract = new ethers.Contract(parcelNFTSCAddress, parcelNFTSC_ABI, wallet);

            console.log("calling isWhitelisted with address: " + wallet.address);

            //call isWhitelisted
            const isWhitelisted = await contract.whitelist(wallet.address);

            return isWhitelisted;
            

        }
        catch (error) {
            if (error instanceof Error) {
                // If the error is an instance of Error, handle it
                return thunkAPI.rejectWithValue(error.message);
            } else {
                // If the error is not an instance of Error, handle it differently
                return thunkAPI.rejectWithValue('An unknown error occurred');
            }
        }

    }
);
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const tokenIdToAddress = (tokenId: { toHexString: () => string; }) => {
    const hexTokenId = tokenId.toHexString().substring(2);
    const lowerCaseAddress = NULL_ADDRESS.substring(
      0,
      42 - hexTokenId.length,
    ).concat(hexTokenId);
    return getAddress(lowerCaseAddress);
  };
// callDatasetContract
export const callDatasetContract = createAsyncThunk(
    'blockchain/callDatasetContract',
    async (args: { name: string; multiaddr: string; checksum: string; }, thunkAPI) => {
        try {
            // Get the current state
            const state = thunkAPI.getState() as RootState;

            // Get the wallet from the state
            const privateKey = state.blockchain.privateKey;

            // Check if the wallet exists
            if (!privateKey) {
                throw new Error("Wallet not found");
            }

            // Create a new wallet instance
            const wallet = new ethers.Wallet(privateKey, provider);

            // Create a new contract instance using the wallet
            const contract = new ethers.Contract('0x799DAa22654128d0C64d5b79eac9283008158730', DatasetABI, wallet);

            console.log(`calling dataset method with args: owner=${wallet.address}, name=${args.name}, multiaddr=${args.multiaddr}, checksum=${args.checksum}`);
            const multiaddr_bytes = ethers.utils.toUtf8Bytes(args.multiaddr);

            /// Call the method on the contract
            const tx = await contract.createDataset(wallet.address, args.name, multiaddr_bytes, args.checksum, { gasPrice: 0, gasLimit: 1000000 });

            // Wait for the transaction to be confirmed
            const txReceipt = await tx.wait(1); // replace 1 with the number of confirmations you want to wait for

             // Extract Transfer event from the transaction receipt logs
            const transferEvent = txReceipt.events.find((event: { event: string; }) => event.event === 'Transfer');

            // If Transfer event is not found, throw an error
            if (!transferEvent) {
                throw new Error('Transfer event not found in transaction logs');
            }

            // Extract tokenId from the arguments of the Transfer event
            const tokenId = transferEvent.args.tokenId;

            // Convert tokenId into an address
            const address = tokenIdToAddress(tokenId); // replace with your actual conversion function

            console.log(`Dataset created with address: ${address}`);
            

            return { address, txHash: txReceipt.transactionHash };



            
        }
        catch (error) {
            if (error instanceof Error) {
                // If the error is an instance of Error, handle it
                return thunkAPI.rejectWithValue(error.message);
            } else {
                // If the error is not an instance of Error, handle it differently
                return thunkAPI.rejectWithValue('An unknown error occurred');
            }
        }
    }
);


//mint parcel
export const mintParcel = createAsyncThunk(
    'blockchain/mintParcel',
    async (_, thunkAPI) => {
        try {
            // Get the current state
            const state = thunkAPI.getState() as RootState;

            // Get the wallet from the state
            const privateKey = state.blockchain.privateKey;

            // Check if the wallet exists
            if (!privateKey) {
                throw new Error("Wallet not found");
            }


            const wallet = new ethers.Wallet(privateKey, provider);

            const contract = new ethers.Contract(parcelNFTSCAddress, parcelNFTSC_ABI, wallet);
            //mint(_reciever,_uuid,parcel_id,_dataset)
            //random address
            const reciever = "0xaAde65481e74Ebe7EA7D2Ecf767eC2266020C7df";
            const mintParcel = await contract.mint(reciever, "12345", "69", "0x12345");

            return mintParcel;







        }
        catch (error) {
            if (error instanceof Error) {
                // If the error is an instance of Error, handle it
                return thunkAPI.rejectWithValue(error.message);
            } else {
                // If the error is not an instance of Error, handle it differently
                return thunkAPI.rejectWithValue('An unknown error occurred');

            }
        }

    }   
);


            




//blockchain in api del sta skoraj cisto locena api samo whitelista naslove ki lahko klicejo blockchain

//import IExec from 'iexec';
//check if user can write DLMD contract.

//14. whitelist → function whitelist(address _address) call it 

//ipfs ko bo.
//sharani encrypetd key lokalno
//Push encryption key to the SMS (da ga lahko docker masina dekriptira)


//__uuid -- neki unique karkil lahko  parcel id 
//courir mint 2. mint __uuid 
//courirer si na svoj addres naredi nft


//getIdFromUUID()
//pred update box klici approve(0xDD2EBb698bfCcD711E3Cc352a9E3C17b484fB339, getIdFromUUID())
//ko courier odpre avto je prvi dataset ki sporoci da se odpre
//ko se zapre je drugi dataset ki sporoci da se zapre in nek dodaten parmeter ki 10. updateBox → transferownership true
//update box klice samo owner nftja

//client(reciver) je zdaj owner nftja in lahko odpira box spet klice dvakrat updatebox    // ko odpre in zapre 



const blockchainSlice = createSlice({
    name: 'blockchain',
    initialState: {
        connected: false,
        balance: null,
        privateKey: null,
    },
    reducers: {

        setPrivateKey: (state, action) => {
            state.privateKey = action.payload;
        },
    },
    extraReducers: (builder) => {
        // builder.addCase(getBalance.fulfilled, (state, action) => {
        //     state.balance = action.payload;
        // });
    },
});

export const { setPrivateKey } = blockchainSlice.actions;

export default blockchainSlice.reducer;




//za dataset rabimo file
//Prepare encrypted dataset 

// const encrypted = await iexec.dataset.encrypt(fileBytes, key);
// const checksum = await iexec.dataset.computeEncryptedFileChecksum(
//   encrypted
// );

// datasetsEncryptOutput.innerText = "Uploading encrypted file to IPFS";
// const ipfs = create("/dns4/ipfs-upload.iex.ec/https/");
// const uploadResult = await ipfs.add(encrypted);
// const { cid } = uploadResult;
// const multiaddr = `ipfs/${cid.toString()}`;
// const publicUrl = `https://ipfs.iex.ec/${multiaddr}`;

// datasetsEncryptOutput.innerText = "Checking file on IPFS";
// await fetch(publicUrl).then((res) => {
//   if (!res.ok) {
//     throw Error(`Failed to load uploaded file at ${publicUrl}`);
//   }
// });

//zdaj mamo na ipfs  encrypted file in dobim link do fila 
//


//2. Deploy dataset
//Dataset name 
// https:::bitbucket.org:theluka:pbd2023-lab-9:
// Dataset url/ipfs 
// ipfs/QmNmg67ehHQrNt7SivsmgvMSLRcqevqMBqg7ERpKnvQUhN
// Dataset checksum 
// 0x15d67caed6eb13d6b8ea9ac1c80db256e706fbd3862be2aca7693f891f2f7501

//rezultat Dataset deployed at address 0x23F08F97B90733876CA04bc05D61204d9F33509f

//3.Push encryption key to the SMS

//4.Sell dataset
//Restrict to app 0x00000000000

//5 .get dataset problematicno poglej iexec api https://explorer.iex.ec/bellecour/dataset/0xF21719618F1c842a9da4e62989FC3715716fB528








