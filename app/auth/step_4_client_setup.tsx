import { StyleSheet } from 'react-native';

import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import { Button, Chip, Dialog, Portal, TextInput } from 'react-native-paper';
import {useRouter} from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../data/hooks';

import secureReducer, { removeToken} from '../../data/secure';
import { useEffect } from 'react';
import React from 'react';

import { useGetAuthMsgQuery, useRegisterWalletMutation } from '../../data/api';
import { ethers, Wallet } from 'ethers';




export default function Step_4_client_setup() {

  const router = useRouter();

  const secure = useAppSelector((state) => state.secure);
  const dispatch = useAppDispatch();

  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');

  const [emailError, setEmailError] = React.useState('');
  const [usernameError, setUsernameError] = React.useState('');

  const {
    data: msg,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch
  } = useGetAuthMsgQuery();

  const [addNewPost  , { isLoading: isRegistering }] = useRegisterWalletMutation();


  

  
  const handleSubmit = async () => {

   

    
    if (validateEmail(email) && validateUsername(username)) {
        console.log('Email:', email);
        console.log('Username:', username);

        await refetch(); //get auth msg from server and store in redux
        console.log("ff");
        console.log(msg);

       

        console.log(secure.keyChainData?.privateKey!,"private key");
        const signer = new ethers.Wallet(secure.keyChainData?.privateKey!);
        console.log(signer.address,"signer");


        
        const signature = await signer.signMessage(msg?.message!);
            console.log(signature,"signature");

            const wallet : Wallet = JSON.parse(secure.keyChainData?.wallet!);
            console.log(wallet.address,"wallet address");


        //check the signature
        const recoveredAddress = ethers.utils.verifyMessage(
            msg?.message!,
            signature
        );
        console.log(recoveredAddress,"recovered address");
        console.log(recoveredAddress === signer.address,"recovered address === wallet address");


      await addNewPost({
        wallet: signer.address,
        signature: signature,
        timestamp: msg?.timestamp!,
        ...(email !== '' && { email }),
        ...(username !== '' && { username }),
      }).unwrap().then((payload) => {
        console.log(payload,"payload");
      });





        


       

        //get auth msg

        



         






        






      } else {
        if (!validateEmail(email)) {
          setEmailError('Please enter a valid email address');
        }
        if (!validateUsername(username)) {
          setUsernameError('Username should not contain any special characters or spaces');
        }
      }
  };
  const validateEmail = (email: string) => {
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(email) || email.length === 0;
  };
  const validateUsername = (username: string) => {
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(username)  && username.length <= 20 || username.length == 0 ;
  };


  useEffect (() => {

    console.log("step 4");




  },[])



  return (
    <View style={styles.container}>

       

        <Text
        style={{
    
            textAlign: 'center',
            marginBottom: 40,

        }}
        
        >
           enter a few details to get started

        </Text>

        {usernameError ? <Text style={{ color: 'red' }}>{usernameError}</Text> : null}

      
      <TextInput
          label="Username (required)"
          value={username}
          onChangeText={setUsername}
          onBlur={() => {
            if (username && !validateUsername(username)) {
              setUsernameError('Username should not contain any special characters or spaces');
            } else {
              setUsernameError('');
            }
          }}
          mode="outlined"
          autoCapitalize="none"
          autoComplete="username"
          error={Boolean(usernameError)}
          style={{ marginBottom: 16, width: 300 }}

        />

        {emailError ? <Text style={{ color: 'red' }}>{emailError}</Text> : null}



        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          onBlur={() => {
            if (email && !validateEmail(email)) {
              setEmailError('Please enter a valid email address');
            } else {
              setEmailError('');
            }
          }}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={Boolean(emailError)}
          style={{ marginBottom: 16, width: 300 }}

        />


      <Button mode="contained" onPress={handleSubmit}   style={{marginTop: 80, alignSelf: 'center'}}   contentStyle={{flexDirection: 'row-reverse', width: 300, padding: 10}}
      loading={isRegistering || isLoading}
      >
        Submit
      </Button>
    </View>
   
      
      


     
   
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
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
