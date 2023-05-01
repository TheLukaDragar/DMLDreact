import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { REHYDRATE } from 'redux-persist';
import { setToken } from './secure'
import { RootState } from './store'

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
  authToken: {data: string
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

interface BoxItem{
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


// Define a custom baseQuery with a default base URL and headers
const baseQuery = fetchBaseQuery({
  baseUrl: 'https://4gkntp89fl.execute-api.eu-central-1.amazonaws.com/development/',
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
  tagTypes: ['User','AuthMsg','Box','Boxes'],
  


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

            console.log('AuthMsg completed', data);
            
            //works if some cache is already there for the user it will update it
          } catch (error) {

            console.log('AuthMsg Erorr', error);


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

        // transformErrorResponse: (response: any) => {
        //     console.log('transformErrorResponse', response);
        //     return response
        // },

        
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
            console.log('onQueryStarted', arg,dispatch);
            try {
                const { data } = await queryFulfilled;
                dispatch(setToken(data.authToken.data))

                dispatch(apiSlice.util.updateQueryData('getMe', undefined,(draft) => {
                    console.log('patchResult', draft);
                    Object.assign(draft, data.profile)
                  })
                )
                //works if some cache is already there for the user it will update it
              } catch (error) {}

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
            console.log('onQueryStarted /auth/login/wallet', arg);
            



            try {
                const { data } = await queryFulfilled;
                dispatch(setToken(data.authToken.data))
             
                //mannually update the user cache with the new data
               dispatch(apiSlice.util.updateQueryData('getMe', undefined,(draft) => {
                    console.log('patchResult', draft);
                    Object.assign(draft, data.profile)
                  })
                )
                //works if some cache is already there for the user it will update it
                

              } catch (error) {
                console.log('error /auth/login/wallet', JSON.stringify(error));


              }

        },

        transformErrorResponse(baseQueryReturnValue, meta, arg) {
            console.log('transformErrorResponse', baseQueryReturnValue);
            return baseQueryReturnValue
        },

        



        //invalidatesTags: ['User'] //no need to invalidate the user cache as it is updated manually
        
    }),
    getMe : builder.query<User, void>({  
        query: () => ({
            url: '/users/me',
            method: 'GET',

        }),
        transformResponse: (response: User) => response,

        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
            console.log('onGetme', arg,dispatch);
            try {
                const { data } = await queryFulfilled;
                console.log('data', data);
              } catch (error) {}

        },

        providesTags : ['User'],

        

    }),
    //box endpoints
    getBoxes: builder.query<GetBoxesResponse, void>({
      query: () => ({
        url: '/box',
        method: 'GET',
      }),
      transformResponse: (response: GetBoxesResponse) => response,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        console.log('getBoxes called')
        try {
          const { data } = await queryFulfilled;
          console.log('getBoxes data', data);
        } catch (error) {
          console.log('getBoxes error', JSON.stringify(error));
    
        }
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
            console.log('getBox', arg,dispatch);
            try {
                const { data } = await queryFulfilled;
                console.log('data', data);
              } catch (error) {}

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
            console.log('onQueryStarted /box/connect', arg,dispatch);
            
            try {
                const { data } = await queryFulfilled;
                console.log('data', JSON.stringify(data));

              } catch (error) {
                console.log('error', JSON.stringify(error));
              }
        },

        transformErrorResponse(baseQueryReturnValue, meta, arg) {
            console.log('transformErrorResponse', baseQueryReturnValue);
            return baseQueryReturnValue
        },

      }),







    








  }),
  
})

import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

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
export const { useGetAuthMsgQuery, useRegisterWalletMutation , useLoginWalletMutation,  useGetMeQuery , useLazyGetAuthMsgQuery
, useGetBoxesQuery, useGetBoxQuery, useLazyGetBoxQuery, useLazyGetBoxesQuery,useConnectBoxMutation


} = apiSlice
