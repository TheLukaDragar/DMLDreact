import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';


// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values"

// Import the the ethers shims (**BEFORE** ethers)
import "@ethersproject/shims"

import { ethers } from 'ethers';


//from gimly
export type KeyChainData = {
    wallet: string | null
    privateKey: string | null
    mnemonic: string | null
    pin: string | null
    did?: string | null
}

export type UserData = {
    token: string | null
}








//craate a secure slice use secure store to store the mnemonic
const secureSlice = createSlice({
    name: 'secure',
    initialState: {
        keyChainData: {
            wallet: '',
            privateKey: '',
            mnemonic: '',
            pin: '',
            did: ''
        } as KeyChainData,
        userData: {
            token: ''
        } as UserData,
        loading: true,
        is_wallet_setup: false,
        is_user_logged_in: false,

    },
    reducers: {      


    },
    extraReducers: (builder) => {
        builder.addCase(getSecure.fulfilled, (state, action) => {


            state.keyChainData = action.payload?.keyChainData!;
            state.userData = action.payload?.userData!;

            if (state.keyChainData.mnemonic != null && state.keyChainData.mnemonic != '') {
                //state.is_wallet_setup = true;
                //TODO ENABLE 
            }

            if (state.userData.token != null && state.userData.token != '') {
                state.is_user_logged_in = true;
            }



            //log data here
            console.log('getSecure.fulfilled');
            state.loading = false;
        });
        
        builder.addCase(getSecure.rejected, (state, action) => {
           //log error here
            console.log('getSecure.rejected', action.error);
        }
        );

        builder.addCase(getSecure.pending, (state, action) => {
            console.log('getSecure.pending');
        }
        );

        //create a new wallet
        builder.addCase(createWallet.fulfilled, (state, action) => {
            console.log('createWallet.fulfilled');
            state.keyChainData = action.payload?.keyChainData!;
            state.is_wallet_setup = true;
        }
        );

        builder.addCase(createWallet.rejected, (state, action) => {
            console.log('createWallet.rejected', action.error);
        }
        );

        builder.addCase(createWallet.pending, (state, action) => {
            console.log('createWallet.pending');
        }
        );

        //get token
        builder.addCase(getToken.fulfilled, (state, action) => {
            console.log('getToken.fulfilled');
            state.userData.token = action.payload
        }
        );
        //remove token
        builder.addCase(removeToken.fulfilled, (state, action) => {
            console.log('removeToken.fulfilled');
            state.userData.token = null;
            state.is_user_logged_in = false;
        }
        );
        //set token
        builder.addCase(setToken.fulfilled, (state, action) => {
            console.log('setToken.fulfilled', action.payload);
            state.userData.token = action.payload;
            state.is_user_logged_in = true;
        }
        );
        //pending
        builder.addCase(getToken.pending, (state, action) => {
            console.log('getToken.pending');
        }
        );
        //rejected
        builder.addCase(getToken.rejected, (state, action) => {
            console.log('getToken.rejected', action.error);
        }
        );




    },



});

export const getSecure= createAsyncThunk(
    'secure/getSecure',
    async (_,thunkAPI) => {
        let keyChainData = {
            wallet: null,
            privateKey: null,
            mnemonic: null,
            pin: null,
            did: null
        } as KeyChainData;

        let userData = {
            token: null

        } as UserData;

        try {

            //wait 5s for testing
            //await new Promise((resolve) => setTimeout(resolve, 5000));

            // await SecureStore.deleteItemAsync('wallet');
            // await SecureStore.deleteItemAsync('privateKey');
            // await SecureStore.deleteItemAsync('mnemonic');
            // await SecureStore.deleteItemAsync('pin');
            // await SecureStore.deleteItemAsync('did');
            // await SecureStore.deleteItemAsync('token');

            //for testing

            //get from secure store
            keyChainData.wallet = await SecureStore.getItemAsync('wallet');
            keyChainData.privateKey = await SecureStore.getItemAsync('privateKey');
            keyChainData.mnemonic = await SecureStore.getItemAsync('mnemonic');
            keyChainData.pin = await SecureStore.getItemAsync('pin');
            keyChainData.did = await SecureStore.getItemAsync('did');

            userData.token = await SecureStore.getItemAsync('token');

            console.log('getSecure', userData);


            return {
                keyChainData,
                userData

            }

        } catch (error) {

            console.error('getSecure', error);

            //TODO: handle error

            //IMPORTANT IF THIS ERROR HAPPENS 
            //it means the app was reinstalled and the secure store became corrupted
            //we need to delete the secure store and create a new wallet
            
            //delete secure store
            await SecureStore.deleteItemAsync('wallet');
            await SecureStore.deleteItemAsync('privateKey');
            await SecureStore.deleteItemAsync('mnemonic');
            await SecureStore.deleteItemAsync('pin');
            await SecureStore.deleteItemAsync('did');
            await SecureStore.deleteItemAsync('token');

            return {
                keyChainData,
                userData

            }

            //return thunkAPI.rejectWithValue("secure store error");
        }



       

    }
);

//create new wallet with ethers and store in secure store ecrypted with pin
export const createWallet = createAsyncThunk(
    'secure/createWallet',
    async (pin: string, thunkAPI ) => {

        if (!pin || pin.length !== 4) {
            return thunkAPI.rejectWithValue('pin must be 4 digits');
        }

        //delays for testing
        await new Promise((resolve) => setTimeout(resolve, 5000));

        //create new wallet //gimly
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
            await SecureStore.setItemAsync('wallet', encryptedWallet);
            console.log('createWallet',"wallet saved");
            await SecureStore.setItemAsync('privateKey', wallet.privateKey);
            await SecureStore.setItemAsync('mnemonic', wallet.mnemonic.phrase);
            console.log('createWallet',"mnemonic saved");
            await SecureStore.setItemAsync('pin', pin);

            console.log('createWallet',"saved wallet");

        
            return {
              mnemonicPhrase: wallet.mnemonic.phrase,
              keyChainData: { //only used for updating the state
                wallet: encryptedWallet,
                privateKey: wallet.privateKey,
                mnemonic: wallet.mnemonic.phrase,
                pin: pin} as KeyChainData
            }
          } catch (error) {
            return thunkAPI.rejectWithValue(error)
          }
        }
);

//get token from backend
export const getToken = createAsyncThunk(
    'secure/getToken',
    async (pin: string, thunkAPI) => {

        //wait 3 seconds
        await new Promise((resolve) => setTimeout(resolve, 3000));


        return 'hahhahaha'; //
    }
);

//remove token from backend
export const removeToken = createAsyncThunk(
    'secure/removeToken',
    async ( _,thunkAPI) => {
        await SecureStore.deleteItemAsync('token');
        return null;
    }
);

//set token in secure store
export const setToken = createAsyncThunk(
    'secure/setToken',
    async (token: string, thunkAPI) => {
        await SecureStore.setItemAsync('token', token);
        return token;
    }
);







export default secureSlice.reducer;





