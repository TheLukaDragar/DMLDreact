import { StyleSheet } from 'react-native';

import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import { Button } from 'react-native-paper';
import {useRouter} from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../data/hooks';

import secureReducer, { createWallet, removeToken} from '../../data/secure';
import { useEffect, useState } from 'react';
import PinInput from '../../components/PinInput';
import React from 'react';




export default function Step_1_create_wallet() {

  const router = useRouter();
  const secure = useAppSelector((state) => state.secure);
  const dispatch = useAppDispatch();

  //state for pin
    const [pinn, setPin] = useState("");
    const [pinConfirm, setPinConfirm] = useState("");
    const [match, setMatch] = useState(false);
    const [loading, setLoading] = useState(false);
    




  useEffect (() => {

    console.log("secure updated in step 1");

    //if wallet is set, go to step 2
    if (secure.keyChainData.wallet != null) {
        router.push('auth/step_2_write_down_mnemonic');
        setLoading(false);
    }


  },[secure.keyChainData.wallet])

  return (
    <View style={styles.container}>

        <Text
        style={{marginTop: 20, padding: 10}}



        >
            {pinConfirm == '' ? "Please set a pin for the app" : [pinConfirm == pinn ? "Pin set" : "Please confirm your pin"]}
        </Text>

        
       
    
        <View
       pointerEvents={match ? "none" : "auto"}
        
        
        >
        <PinInput 

        check={pinConfirm == '' ? '' : pinConfirm}
        
        length={4} onChange={(pin) => {setPin(pin)}
        
        } 
          onFulfill={ (pin) => { 
           
            if (pinConfirm == '') {
            setPin("");
            setPinConfirm(pin);
            console.log("confirm please");
            }else{


            if (pinConfirm == pin) {
                console.log("match");
                setMatch(true);
                //remove focus from pin input
            } 
            else{
                console.log("no match");
                setMatch(false);
            }
           
        
        } } }/>

        </View>
        

        <Button
        disabled={(pinn.length < 4 && pinConfirm == '')  || (!match && pinConfirm != '') }
        onPress={() => {

            if (pinConfirm == '') {
                setPin("");
                setPinConfirm(pinn);
            }else{
                if (pinConfirm == pinn) {


            setLoading(true);
            setTimeout(() => {
                dispatch(createWallet(pinn));
            }, 100);
                }

            }
           
        }
        }

        loading={loading}
            
            mode="contained"
        style={{marginTop: 20, padding: 10}}>
        {loading ? "creating wallet" : "next"}
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
