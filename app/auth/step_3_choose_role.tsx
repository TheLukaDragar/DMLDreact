import { StyleSheet } from 'react-native';

import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import { Button, Chip, Dialog, Portal } from 'react-native-paper';
import {useRouter} from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../data/hooks';

import secureReducer, { removeToken} from '../../data/secure';
import { useEffect } from 'react';
import React from 'react';



export default function Step_3_choose_role() {

  const router = useRouter();

  const secure = useAppSelector((state) => state.secure);
  const dispatch = useAppDispatch();




  useEffect (() => {



  },[])

  return (
    <View style={styles.container}>

        <Text
        
        style={{fontSize: 15,  textAlign: 'center', margin: 20}}
        
        >
            Please choose your role

        </Text>

      <View style={{
    

        marginTop: 40,
    
    }}>
        <Button style={{marginTop: 20, alignSelf: 'center'}}
        mode="outlined"
        onPress={() => router.push('auth/step_4_create_account')}
        icon="arrow-right"
        contentStyle={{flexDirection: 'row-reverse',
        width: 300,
        padding: 20

    
    }}
        >PD Courier
        </Button>

        <Button style={{marginTop: 20, alignSelf: 'center'}}
        mode="outlined"
        onPress={() => router.push('auth/step_4_create_account')}
        icon="arrow-right"
        
        contentStyle={{flexDirection: 'row-reverse',   width: 300,justifyContent: 'space-evenly' , alignItems: 'center', paddingLeft: 0, paddingRight: 8, padding: 20
        }}
        >Smart box owner</Button>

        <Button style={{marginTop: 20, alignSelf: 'center'}}
        mode="outlined"
        onPress={() => router.push('auth/step_4_client_setup')}
        icon="arrow-right"
        contentStyle={{flexDirection: 'row-reverse',   width: 300,
        padding: 20
    }}
        >Client
        </Button>



   
      
            


        </View>

      
      


     
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
