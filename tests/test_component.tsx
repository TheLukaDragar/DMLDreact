import { StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Button, Snackbar } from 'react-native-paper';

import { useAppDispatch, useAppSelector } from '../data/hooks';

import { ethers } from 'ethers';
import React, { useEffect } from 'react';
import { isErrorWithMessage, isFetchBaseQueryError, useLazyGetAuthMsgQuery, useLoginWalletMutation } from '../data/api';
import { loadDemoClientWallet } from '../data/secure';



export const loginPassed= jest.fn();

export default function TestComponent() {


  const secure = useAppSelector((state) => state.secure);
  const dispatch = useAppDispatch();

  const [Login, { isLoading: isLoginIn }] = useLoginWalletMutation();

  const [getMessageToSign, { isLoading: IsLoadingMsg }] = useLazyGetAuthMsgQuery();

  const [ErrorMessage, setError] = React.useState("");


  useEffect(() => {

    //console.log(secure.userData);


  }, [])

  async function login() {
    try {
      const msg = await getMessageToSign().unwrap();
  
      if (secure.is_wallet_setup === false) {
        throw new Error("wallet not setup");
      }
  
      console.log(secure.keyChainData?.privateKey!, "private key");
      console.log(msg?.message!, "message");
      const signer = new ethers.Wallet(secure.keyChainData?.privateKey!);
      const signature = await signer.signMessage(msg?.message!);

      const recoveredAddress = ethers.utils.verifyMessage(msg?.message!, signature);
  
      console.log(recoveredAddress === signer.address, "recovered address === wallet address");
  
      const result = await Login({
        wallet: signer.address,
        signature: signature,
        timestamp: msg?.timestamp!,
      }).unwrap();
  
      console.log(result);

      loginPassed(true);


    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        const errMsg = 'error' in err ? err.error : JSON.stringify(err.data)
        console.log("fetch error", err);
        setError(errMsg);

      } else if (isErrorWithMessage(err)) {
        console.log("error with message , ", err);
        setError(err.message);
      }
      
    }
  }

  async function demo_client_login() {
    try {


      const secure_data = await dispatch(loadDemoClientWallet()) 

      const msg = await getMessageToSign().unwrap();
  
      if (secure.is_wallet_setup === false) {
        throw new Error("wallet not setup");
      }
  
      console.log(secure.keyChainData?.privateKey!, "private key");
      console.log(msg?.message!, "message");
      const signer = new ethers.Wallet(secure.keyChainData?.privateKey!);
      const signature = await signer.signMessage(msg?.message!);

      const recoveredAddress = ethers.utils.verifyMessage(msg?.message!, signature);
  
      console.log(recoveredAddress === signer.address, "recovered address === wallet address");
  
      const result = await Login({
        wallet: signer.address,
        signature: signature,
        timestamp: msg?.timestamp!,
      }).unwrap();
  
      console.log(result);
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        const errMsg = 'error' in err ? err.error : JSON.stringify(err.data)
        console.log("fetch error", err);
        setError(errMsg);
      } else if (isErrorWithMessage(err)) {
        console.log("error with message , ", err);
        setError(err.message);
      }
    }
    
  }




    return ( 
      <div>
      <span>Test Component</span>
      <button onClick={() => login()}>Login</button>
      <button onClick={demo_client_login}>Demo Client Login</button>

    </div>
    )
    


}


