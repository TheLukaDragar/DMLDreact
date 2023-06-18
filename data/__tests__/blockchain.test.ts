/**
 * @jest-environment jsdom
 */
import "whatwg-fetch";

import { configureStore } from '@reduxjs/toolkit';
import { AnyAction } from 'redux';
import blockchainSlice, { ApproveTransfer, ApproveTransferResponse, CreateDatasetResponse, Metadata, MintBox, MintBoxResponse, UpdateBox, UpdateBoxResponse, UploadMetadataToIPFSResponse, approveTransfer, callCreateDataset, callPushToSMS, callSellDataset, getBoxDatasets, isWhitelisted, mintBox, setPrivateKey, updateBox, uploadMetadataToIPFS } from '../blockchain';
import { approveTransferAndCheck, checkWhitelistedStatus, createDatasetAndCheck, make_newDatasetAndCheck, mintBoxAndCheck, pushToSMSAndCheck, sellDataset, setPrivateKeyAndCheckIt, updateBoxAndCheck, uploadMetadataAndCheck } from "./blockchain_utility";

jest.mock('expo-constants', () => require('../../tests/mockExpoConstants'));





describe('blockchainSlice', () => {
    let store: ReturnType<typeof configureStore>;

    const privateKey_Courier = "0x6a3c63737cd800c0367abfb24d6f845de550907257ef1e3786583534c1440d1f";
    const privateKey_Client = "0xdbaa334fb6984b34062ff704300dd7dc47b6101f0feaf875d361dbe7e5f07786";
    const privateKey_UnWhitelisted = "0x143c63737cd805c0367abfb24d6f845de550907257ef1e3786583534c1440d1f";


    let uploadToIPFS_Result: UploadMetadataToIPFSResponse;
    let createDataset_Result: CreateDatasetResponse;

    let mintBox_Result: MintBoxResponse;
    let datasets: string[] = [];




    beforeEach(() => {
        // setup blockchain slice
        store = configureStore({
            reducer: {
                blockchain: blockchainSlice,
            },
        });
    });

   

    it('sets the private key correctly in the store', async () => {
        await setPrivateKeyAndCheckIt(privateKey_Client, store);
    });


    it('confirms that a whitelisted client is recognized as whitelisted', async () => {
        await checkWhitelistedStatus(privateKey_Client, true, store);
    });

    it('confirms that a whitelisted courier is recognized as whitelisted', async () => {
        await checkWhitelistedStatus(privateKey_Courier, true, store);
    });

    it('confirms that an unwhitelisted address is recognized as not whitelisted', async () => {
        await checkWhitelistedStatus(privateKey_UnWhitelisted, false, store);
    });

    //upload to ipfs
    it('upload MetaData to IPFS', async () => {

        //call uploadToIPFS
        await checkWhitelistedStatus(privateKey_Courier, true, store);


        const metadata: Metadata = {
            location: "test",
            timestamp: Date.now().toString(),
            testingEnv: true,
        }

        uploadToIPFS_Result = await uploadMetadataAndCheck(metadata, store);
        console.log("metadata uploaded successfully");
        console.log(uploadToIPFS_Result);

    }, 1000000);

    //create dataset nft
    it('create Dataset', async () => {

        await checkWhitelistedStatus(privateKey_Courier, true, store);


        createDataset_Result = await createDatasetAndCheck(uploadToIPFS_Result, store);
        console.log("dataset created successfully");
        console.log(createDataset_Result);

    }, 1000000);

    //callPushToSMS
    it('push secret to SMS', async () => {

        await checkWhitelistedStatus(privateKey_Courier, true, store);


        await pushToSMSAndCheck(createDataset_Result.datasetAddress, createDataset_Result.aesKey, store);
        console.log("pushed to sms successfully");

    }, 1000000);

    //sell dataset
    it('sell Dataset', async () => {

        await checkWhitelistedStatus(privateKey_Courier, true, store);



        let res = await sellDataset(createDataset_Result, 0, store);

        console.log("dataset sold successfully");
        console.log(res);

    }, 1000000);

    it('(Mint Parcel NFT) mint the NFT', async () => {

        await checkWhitelistedStatus(privateKey_Courier, true, store);



        //fakers lib za uuid

        const id = Math.floor(Math.random() * 10000).toString()   //use timestamp as id for parcel //p[arcel id je lahko isti vedno
        console.log(id);


        const args: MintBox = {
            reciever_address: "0xD52C27CC2c7D3fb5BA4440ffa825c12EA5658D60",
            dataset: createDataset_Result.datasetAddress,
            parcel_id: "1",
        }


        mintBox_Result = await mintBoxAndCheck(args, store);

        datasets.push(createDataset_Result.datasetAddress); //store created dataset addresses for later use
        console.log("minted NFT successfully");
        console.log(mintBox_Result);

    }, 1000000);

    it('Approve transfer of NFT', async () => {

        await checkWhitelistedStatus(privateKey_Courier, true, store);

        const args: ApproveTransfer = {
            to: "0xD52C27CC2c7D3fb5BA4440ffa825c12EA5658D60",
            tokenId: mintBox_Result.tokenId,
        }
        const res = await approveTransferAndCheck(args, store);

        console.log("approved transfer of NFT successfully");
        console.log(res);

    }, 1000000);

    it('Updates MetaData when opening the Box', async () => {

        await checkWhitelistedStatus(privateKey_Courier, true, store);

        const newMetadata: Metadata = {
            location: "test2",
            timestamp: Date.now().toString(),
            testingEnv: true,
        }
        const newDataset = await make_newDatasetAndCheck(newMetadata, store);

        const args: UpdateBox = {
            tokenId: mintBox_Result.tokenId,
            dataset: newDataset,
            transferOwnership: false,
        }
        const res = await updateBoxAndCheck(args, store);
        console.log("updated box successfully");
        console.log(res);

        datasets.push(newDataset);



    }, 1000000);

    it('Updates MetaData when closing the Box and transfers  NFT ownership', async () => {

        await checkWhitelistedStatus(privateKey_Courier, true, store);



        const newMetadata: Metadata = {
            location: "test3",
            timestamp: Date.now().toString(),
            testingEnv: true,
        }
        const newDataset = await make_newDatasetAndCheck(newMetadata, store);

        const args: UpdateBox = {
            tokenId: mintBox_Result.tokenId,
            dataset: newDataset,
            transferOwnership: true,
        }
        const res = await updateBoxAndCheck(args, store);
        console.log("updated box successfully");
        console.log(res);

        datasets.push(newDataset);



    }, 1000000);

    //get box datasets
    it('get box datasets', async () => {

        await checkWhitelistedStatus(privateKey_Courier, true, store);



        //call callGetBoxDatasets
        const res = await store.dispatch(getBoxDatasets(
            mintBox_Result.tokenId,
        ) as unknown as AnyAction).unwrap();

        console.log("got box datasets successfully");
        console.log(res);

        //rs sqould equal to datasets array
        expect(res).not.toBeUndefined();
        expect(res).not.toBeNull();
        expect(res).not.toBe("");

        expect(res).toEqual(datasets);


    }
        , 1000000);


    //rate user /todo 
    //ALI RATAM SAMO USERJA KI JE NFT OWNER ALI TUDI BOX SAMO BOX NIMA NASLOVA. 







});





