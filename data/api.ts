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
  tagTypes: ['User','AuthMsg'],
  


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
        console.log('AuthMsg', arg,dispatch);
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
            console.log('onQueryStarted', arg,dispatch);
            



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
                

              } catch (error) {}

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






  }),
  
})

// Export the reducer and middleware separately
export const { reducer, middleware } = apiSlice

// Export the endpoint for use in components
export const { useGetAuthMsgQuery, useRegisterWalletMutation , useLoginWalletMutation,  useGetMeQuery
} = apiSlice
