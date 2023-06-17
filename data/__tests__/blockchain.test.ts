/**
 * @jest-environment jsdom
 */
import "whatwg-fetch"

import { configureStore } from '@reduxjs/toolkit';
import { AnyAction } from 'redux';
import blockchainSlice, { ApproveTransfer, CreateDatasetResponse, Metadata, MintBox, UpdateBox, UploadMetadataToIPFSResponse, approveTransfer, callCreateDataset, callDatasetContract, callPushToSMS, callSellDataset, isWhitelisted, mintBox, setPrivateKey, updateBox, uploadMetadataToIPFS } from '../blockchain';
import { act } from '@testing-library/react';

jest.mock('expo-constants', () => require('../../tests/mockExpoConstants'));





describe('blockchainSlice', () => {
    let store: ReturnType<typeof configureStore>;

    const privateKey_Courier = "0x6a3c63737cd800c0367abfb24d6f845de550907257ef1e3786583534c1440d1f";
    const privateKey_Client = "0xdbaa334fb6984b34062ff704300dd7dc47b6101f0feaf875d361dbe7e5f07786";
    const privateKey_UnWhitelisted = "0x143c63737cd805c0367abfb24d6f845de550907257ef1e3786583534c1440d1f";


    let uploadToIPFS_Result: UploadMetadataToIPFSResponse;
    let createDataset_Result: CreateDatasetResponse;

    let mintBox_Result: { tokenId: string ,txHash: string; };

    const make_newDataset = async (metadata: Metadata) => {
        //ipfs
        const ipfs: UploadMetadataToIPFSResponse = await store.dispatch(uploadMetadataToIPFS(metadata) as unknown as AnyAction).unwrap();
        //dataset
        const dataset: CreateDatasetResponse = await store.dispatch(callCreateDataset(ipfs) as unknown as AnyAction).unwrap();
        //sms
        await store.dispatch(callPushToSMS( {
            dataset_address: dataset.datasetAddress,
            aesKey: dataset.aesKey,
        }
        ) as unknown as AnyAction).unwrap();

        //sell dataset
        await store.dispatch(callSellDataset( {
            dataset_address: dataset.datasetAddress,
            price: 0,
        }
        ) as unknown as AnyAction).unwrap();

        return createDataset_Result.datasetAddress;
    }

        




    beforeEach(() => {
        // setup blockchain slice
        store = configureStore({
            reducer: {
                blockchain: blockchainSlice,
            },
        });
    });

    async function setPrivateKeyAndCheckIt(privateKey: string) {
        await store.dispatch(setPrivateKey(privateKey) as unknown as AnyAction);

        const state: any = store.getState();
        const privateKeyInStore = state.blockchain.privateKey;

        expect(privateKeyInStore).toBe(privateKey);
    }

    it('sets the private key correctly in the store', async () => {
        await setPrivateKeyAndCheckIt(privateKey_Client);
    });

    async function checkWhitelistedStatus(privateKey: string, expectedStatus: boolean) {
        await store.dispatch(setPrivateKey(privateKey) as unknown as AnyAction);

        const result = await store.dispatch(isWhitelisted() as unknown as AnyAction).unwrap();

        expect(result).toBe(expectedStatus);
    }

    it('confirms that a whitelisted client is recognized as whitelisted', async () => {
        await checkWhitelistedStatus(privateKey_Client, true);
    });

    it('confirms that a whitelisted courier is recognized as whitelisted', async () => {
        await checkWhitelistedStatus(privateKey_Courier, true);
    });

    it('confirms that an unwhitelisted address is recognized as not whitelisted', async () => {
        await checkWhitelistedStatus(privateKey_UnWhitelisted, false);
    });

    //upload to ipfs
    it('upload to ipfs', async () => {

        //call uploadToIPFS

        const metadata : Metadata = {
            location: "test",
            timestamp: Date.now().toString(),
            testingEnv:true,
        }

        uploadToIPFS_Result = await store.dispatch(uploadMetadataToIPFS(metadata) as unknown as AnyAction).unwrap();
        console.log("upload to ipfs successfully");
        expect(uploadToIPFS_Result).not.toBeUndefined();
        expect(uploadToIPFS_Result).not.toBeNull();
        expect(uploadToIPFS_Result.ipfsRes.Hash).not.toBeUndefined();
        expect(uploadToIPFS_Result.ipfsRes.Hash).not.toBeNull();
        expect(uploadToIPFS_Result.ipfsRes.Hash).not.toBe("");

        console.log(uploadToIPFS_Result);

    }, 1000000);

    //create dataset nft
    it('create dataset', async () => {
        await checkWhitelistedStatus(privateKey_Courier, true);

        createDataset_Result = await store.dispatch(callCreateDataset( {
            ipfsRes: uploadToIPFS_Result.ipfsRes,
            aesKey: uploadToIPFS_Result.aesKey,
            checksum: uploadToIPFS_Result.checksum,
        }
        ) as unknown as AnyAction).unwrap();

        console.log("dataset created successfully");
        expect(createDataset_Result).not.toBeUndefined();
        expect(createDataset_Result).not.toBeNull();

        expect(createDataset_Result.datasetAddress).not.toBeUndefined();
        expect(createDataset_Result.datasetAddress).not.toBeNull();
        expect(createDataset_Result.datasetAddress).not.toBe("");

        expect(createDataset_Result.txHash).not.toBeUndefined();
        expect(createDataset_Result.txHash).not.toBeNull();
        expect(createDataset_Result.txHash).not.toBe("");

        console.log(createDataset_Result);


    }, 1000000);

    //callPushToSMS
    it('push secret to sms', async () => {
        await checkWhitelistedStatus(privateKey_Courier, true);

        //call callPushToSMS

        await store.dispatch(callPushToSMS( {
            dataset_address: createDataset_Result.datasetAddress,
            aesKey: uploadToIPFS_Result.aesKey,
        }
        ) as unknown as AnyAction).unwrap();

        console.log("pushed to sms successfully");

    }, 1000000);

    //sell dataset
    it('sell dataset', async () => {
        
        await checkWhitelistedStatus(privateKey_Courier, true);

        //call callSellDataset
        let res = await store.dispatch(callSellDataset( {
            dataset_address: createDataset_Result.datasetAddress,
            price: 0,
        }
        ) as unknown as AnyAction).unwrap();

        console.log("dataset sell order placed successfully");
        console.log(res);

    }, 1000000);


    // it('create dataset', async () => {
    //     await checkWhitelistedStatus(privateKey_Courier, true);

    //     //call callDatasetContract
    //     //owner: string; name: string; multiaddr: string; checksum: string; 

    //     datasetres = await store.dispatch(callDatasetContract( true) as unknown as AnyAction).unwrap();
    //     console.log("dataset created successfully");
    //     console.log(datasetres);

    // }, 1000000);

      it('mint parcel', async () => {

        await checkWhitelistedStatus(privateKey_Courier, true);

        //fakers lib za uuid

        

        const id = Math.floor(Math.random() * 10000).toString()   //use timestamp as id for parcel //p[arcel id je lahko isti vedno
        console.log(id);


        const args : MintBox = {
            reciever_address: "0xD52C27CC2c7D3fb5BA4440ffa825c12EA5658D60",
            dataset: createDataset_Result.datasetAddress,
            parcel_id : "1",
        }
            

        mintBox_Result = await store.dispatch(mintBox( args ) as unknown as AnyAction).unwrap();
            
        console.log(mintBox_Result);

    }, 1000000);

    it('approve transfer of nft', async () => {

        await checkWhitelistedStatus(privateKey_Courier, true);

        const args : ApproveTransfer = {
            to: "0xD52C27CC2c7D3fb5BA4440ffa825c12EA5658D60",
            tokenId: mintBox_Result.tokenId,
        }
        const res = await store.dispatch(approveTransfer( args ) as unknown as AnyAction).unwrap();

        expect(res).not.toBeUndefined();
        expect(res).not.toBeNull();
        expect(res.txHash).not.toBeUndefined();
        expect(res.txHash).not.toBeNull();
        expect(res.txHash).not.toBe("");
            
        console.log(res);

    }, 1000000);

    it('updates box data when opening the box', async () => {

        await checkWhitelistedStatus(privateKey_Courier, true);

        const newMetadata : Metadata = {
            location: "test2",
            timestamp: Date.now().toString(),
            testingEnv:true,
        }
        const newDataset = await make_newDataset(newMetadata);
        expect(newDataset).not.toBeUndefined();
        expect(newDataset).not.toBeNull();
        expect(newDataset).not.toBe("");

        const args : UpdateBox = {
           tokenId: mintBox_Result.tokenId,
           dataset: newDataset,
           transferOwnership: false,
        }
        const res = await store.dispatch(updateBox( args ) as unknown as AnyAction).unwrap();

       
        
    }, 1000000);

    it('updates box data when closing the box and transfers ownership', async () => {

        await checkWhitelistedStatus(privateKey_Courier, true);

        const newMetadata : Metadata = {
            location: "test3",
            timestamp: Date.now().toString(),
            testingEnv:true,
        }
        const newDataset = await make_newDataset(newMetadata);
        expect(newDataset).not.toBeUndefined();
        expect(newDataset).not.toBeNull();
        expect(newDataset).not.toBe("");

        const args : UpdateBox = {
           tokenId: mintBox_Result.tokenId,
           dataset: newDataset,
           transferOwnership: true,
        }
        const res = await store.dispatch(updateBox( args ) as unknown as AnyAction).unwrap();

       
        
    }, 1000000);
    
});


