import {SafeAreaView, Text, View} from 'react-native';

import type {ReactNode} from 'react';
import {Button} from 'react-native-paper';
import {useRouter} from 'expo-router';
import {TouchableOpacity} from 'react-native-gesture-handler';
import secureReducer, { getToken} from '../../data/secure';
import { useAppDispatch, useAppSelector } from '../../data/hooks';



const SignIn = (): ReactNode => {
  const router = useRouter();
  
  const secure = useAppSelector((state) => state.secure);
  const dispatch = useAppDispatch();




  return (
    <SafeAreaView style={{flex: 1, marginHorizontal: 18, marginVertical: 12}}>
      <TouchableOpacity onPress={() => router.back()}>
        
      </TouchableOpacity>
      <View style={{height: 28}} />
      <Text style={{fontSize: 24}}>Sign In</Text>
      <Button
        onPress={() => dispatch(getToken("test"))}
        mode="contained"
        style={{marginTop: 20, padding: 10}}>
       test login
      </Button>
      
    </SafeAreaView>
  );
};

export default SignIn;
