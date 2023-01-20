import { StyleSheet,TextInput,KeyboardAvoidingView } from 'react-native';
import { Button } from 'react-native-paper';


import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import BluetoothScanner from '../components/BluetoothScanner';
//import { createEncryptedWallet } from 'gimly-id-app-sdk'
import { useEffect, useState } from 'react';
//import store from redux-toolkit store

import { incrementCount, decrementCount } from '../data/user-slice';
import { setLoading } from '../data/store';
import secureReducer, { getMnemonic , setMnemonic} from '../data/secure';
import { useAppDispatch, useAppSelector } from '../data/hooks';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';
//bleslice
import {setPeriphiralID, setStatus } from '../ble/bleSlice';

//bleservice
import BLEService from '../ble/BLEService';





export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>, ) {

  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.loading);
  const secure = useAppSelector((state) => state.secure);
  const ble = useAppSelector((state) => state.ble);
  const bleService =  BLEService.getInstance();



  

  



  useEffect(() => {
    dispatch(getMnemonic());
    //bleService.setDemo(true);
    dispatch(setPeriphiralID('F9:E0:C3:CE:C3:14'));
   

   
  }, []);




 
  const setPin =   (pin: string) => {
    //set mnemonic to the value of the pin
    dispatch(setMnemonic(pin));

  }

  async function BleConnect() {


    try {

      dispatch(setStatus('connecting'));
      let challenge = await bleService.connect(ble.periphiralID!);

      bleService.onDisconnect(() => {
        console.log('disconnected UI');
        dispatch(setStatus('disconnected'));
      });




      dispatch(setStatus('connected'));
      console.log(challenge);
    
      let solution = bleService.solveChallenge(challenge!);
      dispatch(setStatus('authenticating'));

      let auth = await bleService.authenticate(solution);
      console.log(auth);
    
     
      if (auth) {
        dispatch(setStatus('authenticated'));
        dispatch(setStatus('ready'));
      }else{
        await bleService.disconnect();
        dispatch(setStatus('disconnected'));

      }
    }
    catch (e) {
      alert(e);
      if (e == 'Error: Already connected') {
        dispatch(setStatus('connected'));
      }

    }
  }

  async function BleDisconnect() {
    try {
      await bleService.disconnect();
      dispatch(setStatus('disconnected'));
    }
    catch (e) {
      alert(e);
    }
  }





   
  

 



  return (
    <View style={styles.container}>
     

      <Text style={styles.mnemonic}>Mnemonic: </Text>
      <Text style={styles.mnemonic}>{secure.mnemonic}</Text>


      <ActivityIndicator animating={secure.status === 'loading'} color={MD2Colors.blue500} />


      <TextInput
      

        onSubmitEditing={(event) => setPin(event.nativeEvent.text)}
       
       
        style={{ height: 40, width: '80%', borderColor: 'gray', borderWidth: 1 }}
        
      />



      <Text style={styles.mnemonic}>Count: </Text>
      <Text style={styles.mnemonic}>{user.count}</Text>


      <View style={{flexDirection: 'row'}}>
      <Button icon="plus"  mode="outlined" onPress={() => dispatch(incrementCount())}>
        Increment
      </Button>

      
      <Button icon="minus" mode="outlined" onPress={() => dispatch(decrementCount())}>
        Decrement
      </Button>

      </View>

      <ActivityIndicator animating={loading} color={MD2Colors.blue500} />

     

      <Button icon="bluetooth" mode="contained" onPress={() => BleConnect() } style={{marginTop: 20, padding: 10}}
      >
        {ble.status}
      </Button>

     

      <Button mode="contained" onPress={() => BleDisconnect() }  style={{marginTop: 20,} } 
      >
        disconnect
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
  mnemonic: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
});