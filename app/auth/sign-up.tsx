import {SafeAreaView, Text, View} from 'react-native';

import type {ReactNode} from 'react';
import {Button} from 'react-native-paper';
import {useRouter} from 'expo-router';
import {TouchableOpacity} from 'react-native-gesture-handler';

const SignIn = (): ReactNode => {
  const router = useRouter();

  return (
    <SafeAreaView style={{flex: 1, marginHorizontal: 18, marginVertical: 12}}>
      <TouchableOpacity onPress={() => router.back()}>
      </TouchableOpacity>
      <View style={{height: 28}} />
      <Text style={{fontSize: 24}}>Sign Up</Text>
      <Button
        onPress={() => router.push('auth/sign-in')}
        mode="contained"
        style={{marginTop: 20, padding: 10}}>
        Sign in
      </Button>
      

      
    </SafeAreaView>
  );
};

export default SignIn;
