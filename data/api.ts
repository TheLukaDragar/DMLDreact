import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REHYDRATE } from 'redux-persist';
import { setToken } from './secure';
import { RootState } from './store';
interface User {
  _createTime: string;
  _createUser: null;
  _updateTime: string;
  _updateUser: null;
  authUser: {
    PIN: null;
    _createTime: string;
    _createUser: null;
    _updateTime: string;
    _updateUser: null;
    email: string;
    id: number;
    passwordHash: null;
    permissions: any[];
    roles: any[];
    status: number;
    tableName: string;
    username: string;
  };
  birthDate: null;
  crypto: null;
  details: any[];
  firstName: null;
  id: number;
  lastName: null;
  reputation: null;
  status: number;
  tableName: string;
  userType: null;
}
interface AuthResponse { //message to sign
  authToken: {
    data: string
  },
  profile: User
}
interface WalletAuthMsg {
  message: string
  timestamp: number
}
interface RegisterWallet {
  wallet: string,
  signature: string
  timestamp: number
  email?: string
  username?: string
}
interface connectBox {
  macAddress: string
  did: string
}
interface GetBoxesResponse {
  items: BoxItem[];
  total: number;
}
export interface BoxItem {
  id: number;
  status: number;
  _createTime: string;
  _createUser: number;
  _updateTime: string;
  _updateUser: number;
  macAddress: string;
  did: string;
  licensePlate: null;
  approximateLocation_id: null;
  preciseLocation_id: null;
  imageUrl: null;
  reputationThreshold: null;
  reputation: null;
  description: null;
  user_id: null;
  permission: null;
}
interface Box {
  id: number;
  _createTime: string;
  _createUser: number;
  _updateTime: string;
  _updateUser: number;
  status: number;
  did: string;
  macAddress: string;
  licensePlate: null;
  approximateLocation_id: null;
  approximateLocation: null;
  preciseLocation_id: null;
  preciseLocation: null;
  description: null;
  imageUrl: null;
  reputationThreshold: null;
  reputation: null;
}

interface ApproximateLocation {
  name?: string;
  latitude: number;
  longitude: number;
  inaccuracy: number;
}
export interface PreciseLocation {
  latitude: number;
  longitude: number;
  inaccuracy: number;
}
interface setBoxPreciseLocation{
  boxId: number;
  preciseLocation: PreciseLocation;
}
interface getBoxAccessKeyParams{
  boxId: number;
  preciseLocation: PreciseLocation;
  challenge: string;
}
interface getBoxAccessKeyResponse{
  boxId: number;
  accessKey: string;
}


import Constants from 'expo-constants';

const API_URL = Constants?.expoConfig?.extra?.API_URL || 'https://4gkntp89fl.execute-api.eu-central-1.amazonaws.com/development/'


// Define a custom baseQuery with a default base URL and headers
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers: Headers, { getState }) => {
    const authToken = (getState() as RootState).secure.userData.token
    if (authToken) {
      console.log('authToken', authToken);
      headers.set('Authorization', `Bearer ${authToken}`)
    }
    headers.set('Content-Type', 'application/json')
    return headers
  },
})
// Define the RTK Query API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'AuthMsg', 'Box', 'Boxes'],
  //this is used to persist the data from the api in storage (redux-persist)
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === REHYDRATE) {
      console.log('extractRehydrationInfo', action.payload?.[reducerPath]);
      return action.payload?.[reducerPath]
    }
  },
  endpoints: (builder) => ({
    // Define the endpoint for the auth message
    getAuthMsg: builder.query<WalletAuthMsg, void>({
      query: () => ({
        url: '/auth/wallet-auth-msg',
        method: 'GET',
      }),
      transformResponse: (response: WalletAuthMsg) => response,
      providesTags: ['AuthMsg'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        console.log('AuthMsg started');
        try {
          const { data } = await queryFulfilled;
          console.info('AuthMsg completed', data);
        } catch (error) {
          console.log('AuthMsg Error', JSON.stringify(error));
        }
      },
    }),
    RegisterWallet: builder.mutation<AuthResponse, RegisterWallet>({
      query: (body) => ({
        url: '/auth/register/wallet',
        method: 'POST',
        body,
      }),
      transformResponse: (response: AuthResponse) => response,
      transformErrorResponse: (response: any) => {
          console.log('/auth/register/wallet', response);
          return response
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        console.log('onQueryStarted', arg, dispatch);
        try {
          const { data } = await queryFulfilled;
          dispatch(setToken(data.authToken.data))
          dispatch(apiSlice.util.updateQueryData('getMe', undefined, (draft) => {
            console.log('patchResult', draft);
            Object.assign(draft, data.profile)
          })
          )
          //works if some cache is already there for the user it will update it
        } catch (error) { }
      },
      //invalidatesTags: ['User'] //no need to invalidate the user cache as it is updated manually
    }),
    LoginWallet: builder.mutation<AuthResponse, RegisterWallet>({
      query: (body) => ({
        url: '/auth/login/wallet',
        method: 'POST',
        body,
      }),
      transformResponse: (response: AuthResponse) => response,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        console.info('onQueryStarted /auth/login/wallet', arg);
        try {
          const { data } = await queryFulfilled;
          dispatch(setToken(data.authToken.data))
          //mannually update the user cache with the new data
          dispatch(apiSlice.util.updateQueryData('getMe', undefined, (draft) => {
            console.log('patchResult', draft);
            Object.assign(draft, data.profile)
          })
          )
          //works if some cache is already there for the user it will update it
        } catch (error) {
          //if i need loging
          //console.log('error /auth/login/wallet', JSON.stringify(error));
        }
      },
      transformErrorResponse(baseQueryReturnValue, meta, arg) {
        //using this to log the error better
        console.log('error /auth/login/wallet', baseQueryReturnValue);
        return baseQueryReturnValue
      },
      //invalidatesTags: ['User'] //no need to invalidate the user cache as it is updated manually
    }),
    getMe: builder.query<User, void>({
      query: () => ({
        url: '/users/me',
        method: 'GET',
      }),
      transformResponse: (response: User) => response,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        console.log(' /users/me started');
        try {
          const { data } = await queryFulfilled;
          console.log('data', data);
        } catch (error) { }
      },
      transformErrorResponse: (response: any) => {
        console.log('error /users/me', response);
        return response
      },

      providesTags: ['User'],
    }),
    //box endpoints
    getBoxes: builder.query<GetBoxesResponse, void>({
      query: () => ({
        url: '/box',
        method: 'GET',
      }),
      transformResponse: (response: GetBoxesResponse) => response,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        console.info('onQueryStarted /box')
        try {
          const { data } = await queryFulfilled;
          console.log('getBoxes data', data);
        } catch (error) {}
      },
      transformErrorResponse: (response: any) => {
        console.log('error /box', response);
        return response
      },
      providesTags: ['Boxes'],
    }),
    //get a box data by id
    getBox: builder.query<any, string>({
      query: (id) => ({
        url: `/box/data/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        console.log('getBox', arg, dispatch);
        try {
          const { data } = await queryFulfilled;
          console.log('data', data);
        } catch (error) { }
      }
    }),
    connectBox: builder.mutation<any, connectBox>({
      query: (body) => ({
        url: '/box/connect',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        console.log('onQueryStarted /box/connect', arg, dispatch);
        try {
          const { data } = await queryFulfilled;
          console.log('data', JSON.stringify(data));
        } catch (error) {
        }
      },
      transformErrorResponse: (response: any) => {
        console.log('error /box/connect', response);
        return response
      },
    }),

    ///location/box/:boxId/precise

    setBoxPreciseLocation: builder.mutation<any, setBoxPreciseLocation>({
      query: (body) => {
        const { boxId, preciseLocation } = body;
        return {
          url: `/location/box/${boxId}/precise`,
          method: 'POST',
          body: preciseLocation,
        };
      },
      transformResponse: (response: any) => response,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        console.log('onQueryStarted /location/box/precise', arg, dispatch);
        try {
          const { data } = await queryFulfilled;
          console.log('/location/box/precise fulfiled', JSON.stringify(data));
        } catch (error) {
        }
      },
      transformErrorResponse: (response: any) => {
        console.log('error /location/box/precise', response);
        return response
      },

      invalidatesTags: ['Boxes']

      //todo update the cache with the new location

    }),

    // Note that when listing boxes using box API, preciseLocation is already populated,
    //  meaning this endpoint doesn't need to be called when box is loaded initially.
    //   You should only call this endpoint when refreshing precise location for a box
    //    without refreshing the entire box.

    getBoxPreciseLocation: builder.query<any, string>({
      query: (id) => ({
        url: `/location/box/precise/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        console.log('getBoxPreciseLocation', arg, dispatch);
        try {
          const { data } = await queryFulfilled;
          console.log('/location/box/precise fulfiled', JSON.stringify(data));
        } catch (error) { }
      },
      transformErrorResponse: (response: any) => {
        console.log('error /location/box/precise', response);
        return response
      }

    }),

    getBoxAccessKey: builder.query<getBoxAccessKeyResponse, getBoxAccessKeyParams>({
      query: ({boxId, challenge, preciseLocation}) => ({


        //https://4gkntp89fl.execute-api.eu-central-1.amazonaws.com/box/1/access-key?id=1&longitude=11&latitude=1&inaccuracy=1
      url: `/box/${boxId}/access-key?challenge=${challenge}&location%5Blatitude%5D=${preciseLocation.latitude}&location%5Blongitude%5D=${preciseLocation.longitude}&location%5Binaccuracy%5D=${preciseLocation.inaccuracy}`,
          method: 'GET',
      }),
      transformResponse: (response: any) => response,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          console.log('getBoxAccessKey', arg, dispatch);
          try {
              const { data } = await queryFulfilled;
              console.log('getBoxAccessKey fulfilled', JSON.stringify(data));
          } catch (error) {
            console.log('getBoxAccessKey error', error);
          }
      },
      transformErrorResponse: (response: any) => {
          console.log('error getBoxAccessKey', response);
          return response
      }
    }),
    
  



    createApproximateLocation: builder.mutation<any, ApproximateLocation>({
      query: (body) => ({
        url: '/location/create',
        method: 'POST',
        body,}),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        console.log('onQueryStarted /location/create', arg, dispatch);
        try {
          const { data } = await queryFulfilled;
          console.log('/location/create fulfiled', JSON.stringify(data));
        } catch (error) {
        }
      },
      transformErrorResponse: (response: any) => {
        console.log('error /location/create', response);
        return response
      },

    }),

    updateApproximateLocation: builder.mutation<any, ApproximateLocation>({
      query: (body) => ({
        url: '/location/update',
        method: 'POST',
        body,}),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        console.log('onQueryStarted /location/update', arg, dispatch);
        try {
          const { data } = await queryFulfilled;
          console.log('/location/update fulfiled', JSON.stringify(data));
        } catch (error) {
        }
      },
      transformErrorResponse: (response: any) => {
        console.log('error /location/update', response);
        return response
      },
    }),
















  }),
})
//using fetch because it's easier to implement 
// export const getBoxAccessKey = createAsyncThunk(
//   'boxes/getAccessKey',
//   async ({ id, challenge, location }: {id: string, challenge: string, location: PreciseLocation},thunkAPI) => {
//     // You should use your own API calling mechanism here
//     // fetch is used as an example
//     const state = thunkAPI.getState() as RootState;

//     const user_token = state.secure.userData?.token;
//     console.log('getBoxAccessKey', id, challenge, location, user_token);
//     const response = await fetch(API_URL+`box/${id}/access-key?challenge=${challenge}&location=${JSON.stringify(location)}`, { method: 'GET' , headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user_token}` }});

//     if (!response.ok) {
//       console.log('error getBoxAccessKey', response.status, response);

//       throw new Error('Failed to fetch access key');
//     }

//     const data = await response.json();
//     console.log('getBoxAccessKey fulfilled', JSON.stringify(data));
//     return data;
//   }
// );
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createAsyncThunk } from '@reduxjs/toolkit';
/**
 * Type predicate to narrow an unknown error to `FetchBaseQueryError`
 */
export function isFetchBaseQueryError(
  error: unknown
): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error
}
/**
 * Type predicate to narrow an unknown error to an object with a string 'message' property
 */
export function isErrorWithMessage(
  error: unknown
): error is { message: string } {
  return (
    typeof error === 'object' &&
    error != null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  )
}
// Export the reducer and middleware separately
export const { reducer, middleware } = apiSlice
// Export the endpoint for use in components
export const { useGetAuthMsgQuery, useRegisterWalletMutation, useLoginWalletMutation, useGetMeQuery, useLazyGetAuthMsgQuery
  , useGetBoxesQuery, useGetBoxQuery, useLazyGetBoxQuery, useLazyGetBoxesQuery, useConnectBoxMutation, useSetBoxPreciseLocationMutation, useGetBoxPreciseLocationQuery, useCreateApproximateLocationMutation, useUpdateApproximateLocationMutation,useGetBoxAccessKeyQuery,useLazyGetBoxAccessKeyQuery
} = apiSlice
