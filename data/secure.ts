import { createSlice, PayloadAction,createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';



export const getMnemonic = createAsyncThunk(
    'secure/getMnemonic',
    async () => {
        //sleep for 2 seconds
        //await new Promise((resolve) => setTimeout(resolve, 1));
        console.log('getMnemonic');
        const mnemonic = await SecureStore.getItemAsync('mnemonic');
        if (mnemonic === null) {
            return '';
        }
        return mnemonic;
    }
);

//set mnemonic in secure store

export const setMnemonic = createAsyncThunk(
    'secure/setMnemonic',
    async (mnemonic: string) => {
        console.log('setMnemonic');
        await SecureStore.setItemAsync('mnemonic', mnemonic);
        return mnemonic;
    }
);



//craate a secure slice use secure store to store the mnemonic
const secureSlice = createSlice({
    name: 'secure',
    initialState: {
        status : 'idle' as 'idle' | 'loading' | 'failed',
        mnemonic: '',
    },
    reducers: {
        
        
    },
    extraReducers: (builder) => {
        builder.addCase(getMnemonic.fulfilled, (state, action) => {
            
            console.log('getMnemonic fulfilled');
            state.mnemonic = action.payload;
            state.status = 'idle';
        });
        builder.addCase(setMnemonic.fulfilled, (state, action) => {
            console.log('setMnemonic fulfilled');
            state.mnemonic = action.payload;
            state.status = 'idle';
            
        }
        );
        //handle error
        builder.addCase(getMnemonic.rejected, (state, action) => {
            console.log('getMnemonic rejected');
            state.mnemonic = '';
            state.status = 'failed';
        }
        );
        builder.addCase(setMnemonic.rejected, (state, action) => {
            console.log('setMnemonic rejected');
            state.mnemonic = '';
            state.status = 'failed';
        }
        );
        //handle loading
        builder.addCase(getMnemonic.pending, (state, action) => {
            console.log('getMnemonic pending');
            state.status = 'loading';
        }
        );
        builder.addCase(setMnemonic.pending, (state, action) => {
            console.log('setMnemonic pending');
            state.status = 'loading';
        }
        );


    },
    


});

export default secureSlice.reducer;





