import { StyleSheet } from 'react-native';

import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import { Button, Snackbar } from 'react-native-paper';
import {useRouter} from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../data/hooks';

import secureReducer, { removeToken} from '../../data/secure';
import { useEffect } from 'react';
import { isErrorWithMessage, isFetchBaseQueryError, useGetAuthMsgQuery, useLazyGetAuthMsgQuery, useLoginWalletMutation } from '../../data/api';
import { ethers, Wallet } from 'ethers';
import React from 'react';



export default function TabTwoScreen() {

  const router = useRouter();

  const secure = useAppSelector((state) => state.secure);
  const dispatch = useAppDispatch();

  const [Login  , { isLoading: isLoginIn }] = useLoginWalletMutation();

//   const {
//     data: msg,
//     isLoading: isGettingMsg,
//     isSuccess,
//     isError,
//     error,
//     refetch
//   } = useGetAuthMsgQuery();

const [getMessage,{ isLoading: IsLoadingMsg,error,isError }] = useLazyGetAuthMsgQuery();

const [Error , setError] = React.useState("");



  useEffect (() => {

    //console.log(secure.userData);

    






  },[])

  //login
  async function login() {
    //get the token
    try {


        //todo IT CAN HAPPEN THAT WE DONT GET THE MESSAGE FROM THE SERVER
        //todo WE NEED TO HANDLE THIS CASE

        //get the message from the server
        await getMessage().unwrap().then(async (msg) => {
    

                console.log(secure.keyChainData?.privateKey!,"private key");
                console.log(msg?.message!,"message");
                const signer = new ethers.Wallet(secure.keyChainData?.privateKey!);
                const signature = await signer.signMessage(msg?.message!);
                //check the signature
                const recoveredAddress = ethers.utils.verifyMessage(
                    msg?.message!,
                    signature
                );

                console.log(recoveredAddress === signer.address,"recovered address === wallet address");

                await Login({
                    wallet: signer.address,
                    signature: signature,
                    timestamp: msg?.timestamp!,
                }).unwrap().then((result) => {

                    console.log(result);
                });

    });








    } catch (err) {
        if (isFetchBaseQueryError(err)) {
            // you can access all properties of `FetchBaseQueryError` here
            const errMsg = 'error' in err ? err.error : JSON.stringify(err.data)
            console.log("fetch error");
            setError(errMsg);
          } else if (isErrorWithMessage(err)) {
            // you can access a string 'message' property here
            console.log("error with message");
            setError(err.message);
          }
    }

  }





  return (
    <View style={styles.container}>

<Text style={styles.title}>Welcome to DLMD</Text>

{/* {isError && <Text>{error.status}</Text>} */}

        <Text>
        wallet:
        {secure.keyChainData.privateKey == null ? "null" : secure.keyChainData.privateKey}

      </Text>

      <Text>
        token:
        {secure.userData.token == null ? "null" : secure.userData.token}

      </Text>

      

      <Button
        onPress={() => router.push('auth/step_1_create_wallet')}
        mode="contained"
        contentStyle={{padding: 20, width: 300}}
        style={{marginTop: 20}}>
        
        Begin
      </Button>

      <Button
        onPress={() => login()}
        loading={isLoginIn || IsLoadingMsg}
        mode="contained"
        contentStyle={{padding: 20, width: 300}}
        style={{marginTop: 20}}>
        
        Login
      </Button>

      <Snackbar
        visible={Error != ""}
        onDismiss={() => { setError(""); }}
        action={{
          label: 'Ok',
          onPress: () => {
            // Do something

            setError("");
            
          },
        }}>
        {Error}
      </Snackbar>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
