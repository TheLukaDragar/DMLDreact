import { Button, StyleSheet } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import BluetoothScanner from '../components/BluetoothScanner';
//import { createEncryptedWallet } from 'gimly-id-app-sdk'
import {useState } from 'react';



export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>) {

  const pin = "1234"
  const [mnemonic, setMnemonic] = useState<string>("");

  const makeWallet = async () => {
    console.log("Making wallet");
    savePin(pin);
    
  }
  const savePin = async (pin: string) => {
    if (pin) {
      // await createEncryptedWallet(pin).then((res) => {
      //   setMnemonic(res.mnemonicPhrase);
      //   console.log(res);
      // }
      // )
      setMnemonic("test");
      
    }
  }


  return (
    <View style={styles.container}>
      <BluetoothScanner />
      <Button title="Make wallet" onPress={makeWallet} />
      <Text style={styles.mnemonic}>Mnemonic: </Text> 
      <Text style={styles.mnemonic}>{mnemonic}</Text>
      <Text style={styles.mnemonic}>Pin: </Text> 
    
      <Text style={styles.title}>Tab One</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
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
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
