//create reduxt
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import { ConfigApi } from 'src/services'; //https://github.com/maetio/expo-template/blob/main/src/services/auth-api.ts
import userReducer from './user-slice';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import secureReducer from './secure';
import bleReducer from '../ble/bleSlice';
import { reducer as apiReducer, middleware as apiMiddleware } from './api';
import { setupListeners } from '@reduxjs/toolkit/dist/query';



/**
 * @remarks
 * set the persist configuration
 *
 * @resources
 * Usage with redux persist: https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist
 * Helpful tutorial: https://edvins.io/how-to-use-redux-persist-with-redux-toolkit
 * Splitting the rtk-query api: https://stackoverflow.com/questions/71466817/splitting-api-definitions-with-rtk-query
 */
const persistConfig = {
    key: 'root',
    version: 1,
    storage: AsyncStorage,
    whitelist: ['user','api'], // only user will be persisted
    

};

const apiPersistConfig = {
    key: 'api',
    version: 1,
    storage: AsyncStorage,
    blacklist: ['AuthMsg'], // only user will be persisted
};




//create loading slice
const loadingSlice = createSlice({
    name: 'loading',
    initialState: false,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            return action.payload;
        },
    },
});



// combine reducers
const reducers = combineReducers({
    user: userReducer,
    loading: loadingSlice.reducer,
    secure: secureReducer,
    //[ConfigApi.reducerPath]: ConfigApi.reducer,
    ble: bleReducer,
    api: persistReducer(apiPersistConfig, apiReducer)
});

// set the persisting reducers
const persistedReducers = persistReducer(persistConfig, reducers);

// configure the store
export const store = configureStore({
    reducer: persistedReducers,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(apiMiddleware),
});

setupListeners(store.dispatch) //for rtk-query fetch on x 


// export the redux dispatch and root states
export const { setLoading } = loadingSlice.actions;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;


