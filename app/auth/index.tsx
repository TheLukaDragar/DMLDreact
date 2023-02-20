import { StyleSheet } from 'react-native';

import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import { Button } from 'react-native-paper';
import {useRouter} from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../data/hooks';

import secureReducer, { removeToken} from '../../data/secure';
import { useEffect } from 'react';
import { useGetAuthMsgQuery, useLoginWalletMutation } from '../../data/api';
import { ethers, Wallet } from 'ethers';



export default function TabTwoScreen() {

  const router = useRouter();

  const secure = useAppSelector((state) => state.secure);
  const dispatch = useAppDispatch();

  const [Login  , { isLoading: isLoginIn }] = useLoginWalletMutation ();

  const {
    data: msg,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch
  } = useGetAuthMsgQuery();


  useEffect (() => {

    //console.log(secure.userData);

    






  },[])

  //login
  async function login() {
    //get the token
    try {

        await refetch(); //get auth msg from server and store in redux

        //todo IT CAN HAPPEN THAT WE DONT GET THE MESSAGE FROM THE SERVER
        //todo WE NEED TO HANDLE THIS CASE
        



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








    } catch (e) {
        console.log(e);
    }

  }





  return (
    <View style={styles.container}>

<Text style={styles.title}>Welcome to DLMD</Text>

{isError && <Text>error</Text>}

        <Text>
        wallet:
        {secure.keyChainData.wallet == null ? "null" : secure.keyChainData.wallet}

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
        loading={isLoginIn}
        mode="contained"
        contentStyle={{padding: 20, width: 300}}
        style={{marginTop: 20}}>
        
        Login
      </Button>

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
