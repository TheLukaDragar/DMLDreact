import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import { Button } from 'react-native-paper';
import {useRouter} from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../data/hooks';

import secureReducer, { removeToken} from '../../data/secure';
import { useGetAuthMsgQuery, useGetMeQuery, useLazyGetMyBoxesQuery,useConnectBoxMutation, useLazyGetBoxesQuery } from '../../data/api';
import { useEffect, useState } from 'react';

import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
//import { BLEServiceInstance } from '../../ble/BLEService';
import {scanBleDevices,stopDeviceScan,clearScannedDevices} from '../../ble/bleSlice';

import Layout from'../../constants/Layout';
import { IBLEDevice } from '../../ble/bleSlice.contracts';


export default function TabTwoScreen() {

  const router = useRouter();

  const secure = useAppSelector((state) => state.secure);
  const dispatch = useAppDispatch();

  const [location, setLocation] = useState<LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const ble = useAppSelector((state) => state.ble);
  const scannedDevices = useAppSelector((state) => state.ble.deviceScan.devices);
 // const bleService =  BLEServiceInstance;

  const {
    data: user,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch
  } = useGetMeQuery();

  const [getBoxes,{ data:boxes,isLoading: IsLoadingMsg, error : errorBox, isError : isErrorBox}] = useLazyGetBoxesQuery();
  const [isScanning, setIsScanning] = useState(false);
  const [buttonText, setButtonText] = useState('Start Scan');





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

  

  
  




  async function searchForBox() {

    console.log('searchForBox');

    if (isScanning) {
      dispatch(stopDeviceScan({}));
      setIsScanning(false);
      setButtonText('Start Scan');
  }else{
    dispatch(clearScannedDevices({}));
    dispatch(scanBleDevices());
    setIsScanning(true);
    setButtonText('Stop Scan');
  }

  


  }



  return (
    <View style={styles.container}>

      {isSuccess && <Text>{user?.authUser.username}</Text>}

     {location && <Text>latitude: {location.coords.latitude}</Text>}
      {location && <Text>longitude: {location.coords.longitude}</Text>}
      {errorMsg && <Text>{errorMsg}</Text>}



      
      <Text>
        boxes:
        { boxes?.map((box) => {
          return <Text>{box.name}</Text>
        })}

      </Text>


      <Button
        onPress={() => getBoxes()}
        mode="contained"
        style={{marginTop: 20, padding: 10}}>
        get my boxes
      </Button>

      <Button
        onPress={() => searchForBox()}
        mode="contained"
        icon={'bluetooth'}
        style={{marginTop: 20, padding: 10}}>
        {buttonText}
      </Button>

      <FlatList
                style={{ height: '100%' }}
                contentContainerStyle={{ width: '100%', justifyContent: 'center' }}
                data={scannedDevices}
                renderItem={({ item }) => (
                    <DeviceItem device={item} />
                )}
                />


      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
    </View>
  );
}

interface DeviceItemProps {
  device: IBLEDevice | null
}

const DeviceItem = (props: DeviceItemProps) => {
  const { device } = props;
  const [isConnecting, setIsConnecting] = useState(false);
  const dispatch = useAppDispatch();
  const [Connect  , { isLoading: isConnectingBox, isSuccess: isConnectingBoxSuccess, isError: isConnectingBoxError, error: errorConnectingBox }] = useConnectBoxMutation();


  const connectHandler = async () => {
    if (isConnecting) return;
    if (device?.id){
        setIsConnecting(true);

        await Connect({
          did: device?.name,
          macAddress: device?.id,

        }
        
        ).unwrap().then((result) => {

          console.log(result);
      });


        
        setIsConnecting(false);
    }
    else {
       console.log('no device id')
    }
}

  return (
    <TouchableOpacity style={{ width: Layout.window.width*0.8}} onPress={connectHandler}>
    <Text style={{ paddingVertical: 10 }}>{device?.name}</Text>
</TouchableOpacity>
  )
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
