import { StyleSheet, TextInput, KeyboardAvoidingView } from 'react-native';
import { Button } from 'react-native-paper';
import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import { RootTabScreenProps } from '../../types';
import BluetoothScanner from '../../components/BluetoothScanner';
import { useEffect, useState } from 'react';
//import store from redux-toolkit store
import { incrementCount, decrementCount } from '../../data/user-slice';
import { setLoading } from '../../data/store';
//import secureReducer, { getMnemonic , setMnemonic} from '../../data/secure';
import { useAppDispatch, useAppSelector } from '../../data/hooks';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';
//bleslice
//import {setLog, setPeriphiralID, setStatus } from '../../ble/bleSlice';
import { Buffer } from 'buffer'
//bleservice
//import  { BLEServiceInstance } from '../../ble/BLEService';
import {
  connectDeviceById, manualMotorControl, scanBleDevices,
  selectAdapterState,
  selectConnectedDevice,
  selectScannedDevices, stopDeviceScan, testbutton, keyBotCommand, disconnectDevice
} from '../../ble/bleSlice';
import { ManualMotorControlCommand, KeyBotCommand } from '../../ble/bleSlice.contracts';
export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>,) {
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.loading);
  const secure = useAppSelector((state) => state.secure);
  const ble = useAppSelector((state) => state.ble);
  //const bleService =  BLEServiceInstance;
  const [calibMode, setCalibMode] = useState(false);
  useEffect(() => {
    //dispatch(getMnemonic());
    //bleService.setDemo(true);
    //dispatch(setPeriphiralID('F9:E0:C3:CE:C3:14'));
    console.log("HOME SCREEN");
    //bleService.init();
    //conect to device
  }, []);
  const setPin = (pin: string) => {
    //set mnemonic to the value of the pin
    //dispatch(setMnemonic(pin));
  }
  async function test() {
    let result = await dispatch(testbutton({ h: "" })).unwrap().then((result) => {
      console.log(result);
      return result;
    }).catch((error) => {
      console.log(error);
      return error;
    });
  }
  async function BleConnect() {
    let connectResult = await dispatch(connectDeviceById({ id: "EF:26:EC:7A:11:C0" })).unwrap().then((result) => {
      console.log(result);
      return result;
    }).catch((error) => {
      console.log(error);
      return error;
    });
    // try {
    //   dispatch(setStatus('connecting'));
    //   let challenge = await bleService.connect(ble.periphiralID!);
    //   bleService.onDisconnect(() => {
    //     console.log('disconnected UI');
    //     dispatch(setStatus('disconnected'));
    //   });
    //   dispatch(setStatus('connected'));
    //   console.log(challenge);
    //   let solution = bleService.solveChallenge(challenge!);
    //   dispatch(setStatus('authenticating'));
    //   let auth = await bleService.authenticate(solution);
    //   console.log(auth);
    //   if (auth) {
    //     dispatch(setStatus('authenticated'));
    //     dispatch(setStatus('ready'));
    //     //read calibration mode
    //     let calib = await bleService.readCalibrationMode();
    //     console.log("mode :",calib);
    //     if (calib == '1') {
    //       setCalibMode(true);
    //     }else{
    //       setCalibMode(false);
    //     }
    //     bleService.onCalibrationChange((error,state) => {
    //       if (error) {
    //         console.log(error);
    //       }else{
    //         console.log(state);
    //       }
    //     });
    //     bleService.onLog((error,log) => {
    //       if (error) {
    //         console.log(error);
    //       }
    //       else{
    //         //custom log with yellow color
    //        console.log("BLE LOG:"+ log);
    //        dispatch(setLog(log!));
    //       }
    //     });
    //   }else{
    //     await bleService.disconnect();
    //     dispatch(setStatus('disconnected'));
    //   }
    // }
    // catch (e) {
    //   alert(e);
    //   if (e == 'Error: Already connected') {
    //     dispatch(setStatus('connected'));
    //   }
    // }
  }
  async function BleDisconnect() {
    let result =
      await dispatch(disconnectDevice()).unwrap().then((result) => {
        console.log(result);
        return result;
      }
      ).catch((error) => {
        console.log(error);
      }
      );
  }
  async function BleWriteCalibrationMode(): Promise<void> {
    // try {
    //   await bleService.writeCalibrationMode(calibMode? '0' : '1');
    //   //setCalibMode(!calibMode);
    //   console.log('calibration mode set to: ' + calibMode);
    //   let calib = await bleService.readCalibrationMode();
    //   console.log("mode :",calib);
    //   setCalibMode(!(calib == '0'));
    // }
    // catch (e) {
    //   alert(e);
    // }
  }
  return (
    <View style={styles.container}>
      <ActivityIndicator animating={loading} color={MD2Colors.blue500} />{
        <Button icon="bluetooth" mode="contained" onPress={() => BleConnect()} style={{ marginTop: 20, padding: 10 }}
        >
          {ble.deviceConnectionState.status}
        </Button>}
      <Button mode="contained" onPress={() => BleDisconnect()} style={{ marginTop: 20, }}
      >
        disconnect
      </Button>
      <Text> {ble.connectedDevice?.name}</Text>
      <Text> {ble.sensorStatus.status}</Text>
      <Button mode="contained" onPress={() => test()} style={{ marginTop: 20, }}
      >
        test
      </Button>
      <Text>S1: {ble.midSensorsStatus.sensor_1_status}</Text>
      <Text>S2: {ble.midSensorsStatus.sensor_2_status}</Text>
      <Text>State: {ble.keyBotState.text}</Text>
      <Text>Battery {ble.batteryLevel.text}</Text>
      <View style={{ flexDirection: 'row' }}>
        <Button
          icon=""
          mode="outlined"
          onPress={() =>
            dispatch(
              manualMotorControl({ command: ManualMotorControlCommand.MOTOR1_FORWARD }),
            )
          }
          style={styles.buttonStyle}
        >
          Motor 1 Forward
        </Button>
        <Button
          icon=""
          mode="outlined"
          onPress={() =>
            dispatch(
              manualMotorControl({ command: ManualMotorControlCommand.MOTOR1_BACKWARD }),
            )
          }
          style={styles.buttonStyle}
        >
          Motor 1 Backward
        </Button>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Button
          icon=""
          mode="outlined"
          onPress={() =>
            dispatch(
              manualMotorControl({ command: ManualMotorControlCommand.MOTOR2_FORWARD }),
            )
          }
          style={styles.buttonStyle}
        >
          Motor 2 Forward
        </Button>
        <Button
          icon=""
          mode="outlined"
          onPress={() =>
            dispatch(
              manualMotorControl({ command: ManualMotorControlCommand.MOTOR2_BACKWARD }),
            )
          }
          style={styles.buttonStyle}
        >
          Motor 2 Backward
        </Button>
      </View>
      <View style={{ flexDirection: 'row', marginVertical: 30 }}>
        <Button
          icon=""
          mode="contained"
          contentStyle={{ height: 50, width: 150 }}
          onPress={() =>
            dispatch(keyBotCommand({ command: KeyBotCommand.KEYBOT_PRESS_LEFT }))
          }
          style={styles.buttonStyle}
        >
          press left
        </Button>
        <Button
          icon=""
          mode="contained"
          contentStyle={{ height: 50, width: 150 }}
          onPress={() =>
            dispatch(keyBotCommand({ command: KeyBotCommand.KEYBOT_PRESS_RIGHT }))
          }
          style={styles.buttonStyle}
        >
          press right
        </Button>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Button
          icon=""
          mode="outlined"
          onPress={() =>
            dispatch(keyBotCommand({ command: KeyBotCommand.KEYBOT_EMERGENCY_STOP }))
          }
          style={styles.buttonStyle}
        >
          emergency stop
        </Button>
        <Button
          icon=""
          mode="outlined"
          onPress={() =>
            dispatch(keyBotCommand({ command: KeyBotCommand.KEYBOT_CENTER }))
          }
          style={styles.buttonStyle}
        >
          center
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
    paddingBottom: 20,
  },
  buttonStyle: {
    margin: 5,
  },
});