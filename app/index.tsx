

import { StyleSheet } from 'react-native';

import { Text, View } from '../components/Themed';
import {SplashScreen, useRouter} from 'expo-router';
import { useAppDispatch, useAppSelector } from '../data/hooks';
import { getSecure } from '../data/secure';
import { useEffect } from 'react';
import useCachedResources from '../hooks/useCachedResources';


export default function TabTwoScreen() {

  const router = useRouter();
  const secure = useAppSelector((state) => state.secure);
  const dispatch = useAppDispatch();

  const isLoadingComplete = useCachedResources();






  //wait for the token to be set
  useEffect (() => {

    console.log("INDEX 0",secure.userData);

    dispatch(getSecure());




  },[])
  


  if (!isLoadingComplete || secure.loading) {
    return <SplashScreen />;
  }
  else {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Tab Two</Text>
      </View>
    );
  }
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
