import { StyleSheet } from 'react-native';

import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import { Button } from 'react-native-paper';
import {useRouter} from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../data/hooks';

import secureReducer, { removeToken} from '../../data/secure';
import { useGetAuthMsgQuery, useGetMeQuery, useLazyGetMyBoxesQuery } from '../../data/api';
import { useEffect, useState } from 'react';

import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';


export default function TabTwoScreen() {

  const router = useRouter();

  const secure = useAppSelector((state) => state.secure);
  const dispatch = useAppDispatch();

  const [location, setLocation] = useState<LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    data: user,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch
  } = useGetMeQuery();

  const [getMyBoxes,{ data:boxes,isLoading: IsLoadingMsg, error : errorBox, isError : isErrorBox}] = useLazyGetMyBoxesQuery();



  useEffect(() => {
    (async () => {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);



  return (
    <View style={styles.container}>

      {isSuccess && <Text>{user?.authUser.username}</Text>}

     {location && <Text>latitude: {location.coords.latitude}</Text>}
      {location && <Text>longitude: {location.coords.longitude}</Text>}
      {errorMsg && <Text>{errorMsg}</Text>}



      <Button
        onPress={() => dispatch(removeToken())}
        mode="contained"
        style={{marginTop: 20, padding: 10}}>
        Sign out
      </Button>

      <Text>
        boxes:
        { boxes?.map((box) => {
          return <Text>{box.name}</Text>
        })}

      </Text>


      <Button
        onPress={() => getMyBoxes()}
        mode="contained"
        style={{marginTop: 20, padding: 10}}>
        get my boxes
      </Button>

      <Text style={styles.title}>Tab Two</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
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
