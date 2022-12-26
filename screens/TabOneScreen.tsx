import { StyleSheet,TextInput,KeyboardAvoidingView } from 'react-native';
import { Button } from 'react-native-paper';


import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import BluetoothScanner from '../components/BluetoothScanner';
//import { createEncryptedWallet } from 'gimly-id-app-sdk'
import {useEffect, useState } from 'react';
//import store from redux-toolkit store

import { incrementCount, decrementCount } from '../data/user-slice';
import { setLoading } from '../data/store';
import secureReducer, { getMnemonic , setMnemonic} from '../data/secure';
import { useAppDispatch, useAppSelector } from '../data/hooks';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';



export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>) {

  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.loading);
  const secure = useAppSelector((state) => state.secure);



  useEffect(() => {
    dispatch(getMnemonic());
   
  }, []);




 
  const setPin =   (pin: string) => {
    //set mnemonic to the value of the pin
    dispatch(setMnemonic(pin));

  }
   

 



  return (
    <View style={styles.container}>
      <BluetoothScanner />

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

      <Button icon="plus" mode="contained" onPress={() => loading? dispatch(setLoading(false)) : dispatch(setLoading(true))}>
        Start Loading
      </Button>

     


      
    
      <Text style={styles.title}>Tab One</Text>
    <EditScreenInfo path="/screens/TabOneScreen.tsx" />
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