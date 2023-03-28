import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { BleManager, Device } from 'react-native-ble-plx';
import { RootState } from '../data/store';
import { bleSliceInterface, connectDeviceByIdParams, linkDeviceByIdParams,manualMotorControlParams,ManualMotorControlCommand,KeyBotState,testbuttonParams, NetworkState, toBLEDeviceVM,authenticateDeviceParams, SensorState, MidSensorState, keybotCommandParams, ConnectionState} from './bleSlice.contracts';
import { Buffer } from 'buffer'
import CryptoES from 'crypto-es';
const bleManager = new BleManager();
let device: Device;
let logBuffer: string = "";
const demoDevice = {
    id: 'F9:E0:C3:CE:C3:14',
    name: 'Demo Device',
    rssi: 0,
    solicitedServiceUUIDs: [],
    localName: 'Demo Device',
};
const stopScan = () => {
    console.log('Stopping scan');
    bleManager.stopDeviceScan();
};
export const scanBleDevices = createAsyncThunk('ble/scanBleDevices', async (_, thunkAPI) => {
  // Check if demo mode is on from the global state.
  const state = thunkAPI.getState() as RootState;
  const demoModeOn = state.ble.use_demo_device;
    // If demo mode is on, then we don't need to scan for devices.
    //just add a demo device to the list
    if (demoModeOn) {
        console.log('Demo mode on, adding demo device in scanBleDevices');
        thunkAPI.dispatch(addScannedDevice({ device: demoDevice }));
        return;
    }
    //disconnect if connected
    if (device) {
        await device.cancelConnection();
    }
    console.log('Scanning');
    try {
        bleManager.startDeviceScan(null, null, async (error, scannedDevice) => {
            if (error) {
                console.log('startDeviceScan error: ', error);
                throw new Error(error.toString());
            }
            if (scannedDevice) {
                thunkAPI.dispatch(addScannedDevice({ device: toBLEDeviceVM(scannedDevice) }));
            }
        });
    } catch (error: any) {
        throw new Error(error.toString);
    }
});
export const authenticateDevice = createAsyncThunk('ble/authenticateDevice', async (_, thunkAPI) => {
    // Check if demo mode is on from the global state.
    const state = thunkAPI.getState() as RootState;
    const demoModeOn = state.ble.use_demo_device;
    // If demo mode is on use the demo device.
    if (demoModeOn) {
        console.log('Demo mode on, using demo device in authenticateDevice');
        //make api call to authenticate device todo
        return true;
    }
     //get challenge from box
     let characteristic = await bleManager.readCharacteristicForDevice(device.id, '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34fa').catch((error) => {
        console.log("readCharacteristicForDevice error: " + error);
        throw new Error(error);
      });
      if (characteristic === null) {
        throw new Error("Characteristic not found");
      }
      let challenge = Buffer.from(characteristic.value!, 'base64').toString('ascii').substring(0, 16);
      console.log("challenge: " + challenge);
      //solve here 
        let key = "cQfTjWnZr4u7x!z%"
        const key128Bits = CryptoES.enc.Utf8.parse(key);
        //ecb mode
        const encrypted = CryptoES.AES.encrypt(challenge, key128Bits, { mode: CryptoES.mode.ECB, padding: CryptoES.pad.NoPadding });
        //to hex
        let encryptedHex = encrypted.ciphertext.toString(CryptoES.enc.Hex);
        //to uppercase
        encryptedHex = encryptedHex.toUpperCase();
        console.log("encrypted: " + encryptedHex);
        let solved_challenge = encryptedHex
    let message = solved_challenge.substring(0, 16);
    let encoded = Buffer.from(message).toString('base64');
    console.log("encoded: " + encoded);
    let writeCharacteristic = await bleManager.writeCharacteristicWithResponseForDevice(device.id, '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34fb', encoded);
    if (writeCharacteristic === null) {
      throw new Error("Characteristic not found");
    }
    console.log("characteristic: " + writeCharacteristic.uuid);
    //write the second part of the message
    message = solved_challenge.substring(16, 32);
    //encode to base64
    encoded = Buffer.from(message).toString('base64');
    console.log("encoded 2: " + encoded);
    writeCharacteristic = await bleManager.writeCharacteristicWithResponseForDevice(device.id, '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34fb', encoded);
    if (writeCharacteristic === null) {
      throw new Error("Characteristic not found");
    }
    //read the auth characteristic
    let readCharacteristic = await bleManager.readCharacteristicForDevice(device.id, '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34fc');
    if (readCharacteristic === null) {
      throw new Error("Characteristic not found");
    }
    let value = readCharacteristic.value;
    let auth = Buffer.from(value!, 'base64').toString('ascii');
    console.log("authenticated: " + auth? "true" : "false");
    if(auth === '1') {
      //setup listeners for calibration and battery ...
      //TODO
      //log name
      return true;
    }else {
      throw new Error("Authentication failed");
    }
});
export const connectDeviceById = createAsyncThunk('ble/connectDeviceById', async (params: connectDeviceByIdParams, thunkAPI) => {
    try {
        const { id } = params;
        stopScan();

        //searching
        thunkAPI.dispatch(setConnectionState({ status: ConnectionState.SEARCHING }));


        device = await bleManager.connectToDevice(id)


        //connected
        thunkAPI.dispatch(setConnectionState({ status: ConnectionState.CONNECTING }));
        const deviceChars = await bleManager.discoverAllServicesAndCharacteristicsForDevice(id);
        console.log('Discovered all services and characteristics');
        const services = await deviceChars.services();
        console.log('Got services');
        const serviceUUIDs = services.map(service => service.uuid);
        console.log('Got serviceUUIDs');
        console.log('all done');
        //print name and id
        console.log('Device name: ', device.name);
        console.log('Device id: ', device.id);
        //authenticate
        thunkAPI.dispatch(setConnectionState({ status: ConnectionState.AUTHENTICATING }));
       let auth_result = await thunkAPI.dispatch(authenticateDevice()).unwrap().catch((error) => {
            console.log("authenticateDevice error: " + error);
            throw new Error(error);
        });
        console.log("auth_result: " + auth_result);
        bleManager.monitorCharacteristicForDevice(
            device.id,
            '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
            '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
            (error, characteristic) => {
              if (error) {
                console.log('onLog error: ' + error, error.errorCode);
                return;
              } else {
                let chunk = Buffer.from(characteristic?.value!, 'base64').toString('ascii');
                logBuffer += chunk;
          
                // Split logs based on newline
                const logs = logBuffer.split('\n');
          
                // If there is a complete log (with a newline), dispatch the addLog action
                while (logs.length > 1) {
                  const log = logs.shift();
                  console.log('log: ' + log);
                  thunkAPI.dispatch(addLog(log));
                }
          
                // The last element in the logs array is either an incomplete log or an empty string
                logBuffer = logs[0];
              }
            },
            'log'
          );
            //read sensor status
            // bleManager.readCharacteristicForDevice(device.id, '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34fd').then((characteristic) => {
            //     if (characteristic === null) {
            //         console.log("sensorStatus Characteristic not found");
            //         return;
            //     }
            //     let status = Buffer.from(characteristic.value!, 'base64').toString('ascii');
            //     console.log("status: " + status);
            //     thunkAPI.dispatch(updateKeySensorStatus({ status: status }));
            // }).catch((error) => {
            //     console.log("readCharacteristicForDevice error: " + error);
            // });
            //sensorStatus 00002a3d-0000-1000-8000-00805f9b34fd
            // bleManager.monitorCharacteristicForDevice(device.id, '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34fd', (error, characteristic) => {
            //     if (error) {
            //         console.log("onSensorStatus error: " + error, error.errorCode);
            //         return;
            //     }
            //     else {
            //         let status = Buffer.from(characteristic?.value!, 'base64').toString('ascii');
            //         console.log("sensorStatus: " + status);
            //         thunkAPI.dispatch(updateKeySensorStatus({ status: status }));
            //     }
            // }, 'status');
            //midSensorsStatus 00002a3d-0000-1000-8000-00805f9b34f2 and 00002a3d-0000-1000-8000-00805f9b34f3
            bleManager.monitorCharacteristicForDevice(device.id, '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34f2', (error, characteristic) => {
                if (error) {
                    console.log("onMidSensorsStatus error: " + error, error.errorCode);
                    return;
                }
                else {
                    let status = Buffer.from(characteristic?.value!, 'base64').toString('ascii');
                    console.log("midSensorsStatus: " + status);
                    thunkAPI.dispatch(updateMidSensorsStatus({ status: status    }));
                }
            }, 'midSensorsStatus');
            //read it
            bleManager.readCharacteristicForDevice(device.id, '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34f2').then((characteristic) => {
                if (characteristic === null) {
                    console.log("midSensorsStatus Characteristic not found");
                    return;
                }
                let status = Buffer.from(characteristic.value!, 'base64').toString('ascii');
                console.log("midSensorsStatus: " + status);
                thunkAPI.dispatch(updateMidSensorsStatus({ status: status }));
            }).catch((error) => {
                console.log("readCharacteristicForDevice error: " + error);
            });


            //00002a3d-0000-1000-8000-00805f9b34f4 
            bleManager.monitorCharacteristicForDevice(device.id, '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34f4', (error, characteristic) => {
                if (error) {
                    console.log("onKeyBotState error: " + error, error.errorCode);
                    return;
                }
                else {
                    let status = Buffer.from(characteristic?.value!, 'base64').toString('ascii');
                    //console.log("keyBotState: " + status);
                    thunkAPI.dispatch(updateKeyBotState({ status: status }));
                }

            }, 'keyBotState');

            //battery level 00002a3d-0000-1000-8000-00805f9b34f5
            bleManager.monitorCharacteristicForDevice(device.id, '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34f5', (error, characteristic) => {
                if (error) {
                    console.log("onBatteryLevel error: " + error, error.errorCode);
                    return;
                }
                else {

                    //type float
                    let buffer = Buffer.from(characteristic?.value!, 'base64');
                    let status = buffer.readFloatLE(0);
                    console.log("batteryLevel: " + status);
                    thunkAPI.dispatch(updateBatteryLevel({ batteryLevel: status }));

                }
            }, 'batteryLevel');
            //read it
            bleManager.readCharacteristicForDevice(device.id, '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34f5').then((characteristic) => {
                if (characteristic === null) {
                    console.log("batteryLevel Characteristic not found");
                    return;
                }
                
                let buffer = Buffer.from(characteristic?.value!, 'base64');
                let status = buffer.readFloatLE(0);

                console.log("batteryLevel: " + status);
                thunkAPI.dispatch(updateBatteryLevel({ batteryLevel: status }));
            }).catch((error) => {
                console.log("readCharacteristicForDevice error: " + error);
            });









        return toBLEDeviceVM({ ...device, serviceUUIDs });
    } catch (error: any) {
        throw new Error(error.toString);
    }
});
export const linkDeviceById = createAsyncThunk('ble/linkDeviceById', async (params: linkDeviceByIdParams, thunkAPI) => {
   //todo
});
export const testbutton = createAsyncThunk('ble/testbutton', async (params: testbuttonParams, thunkAPI) => {
    //write test characteristic 00002a3d-0000-1000-8000-00805f9b34f0
    bleManager.writeCharacteristicWithResponseForDevice(device.id, '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34f0', 'AQ==').then((characteristic) => {
        if (characteristic === null) {
            console.log("testbutton Characteristic not found");
            return;
        }
        let status = Buffer.from(characteristic.value!, 'base64').toString('ascii');
        console.log("testbutton: " + status);
        return status;
    }).catch((error) => {
        console.log("testbutton error: " + error);
        return error;
    }
    );
});
export const manualMotorControl = createAsyncThunk('ble/manualMotorControl', async (params: manualMotorControlParams, thunkAPI) => {
    //write to 00002a3d-0000-1000-8000-00805f9b34f1
    const command = params.command;
    //to base64
    const commandBase64 = Buffer.from(command).toString('base64');
    bleManager.writeCharacteristicWithResponseForDevice(device.id, '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34f1', commandBase64).then((characteristic) => {
        if (characteristic === null) {
            console.log("manualMotorControl Characteristic not found");
            return;
        }
        let status = Buffer.from(characteristic.value!, 'base64').toString('ascii');
        console.log("manualMotorControl: " + status);
        return status;
    }
    ).catch((error) => {
            console.log("manualMotorControl error: " + error);
            return error;
        }
    );
});

//keybot command
export const keyBotCommand = createAsyncThunk('ble/keyBotCommand', async (params: keybotCommandParams, thunkAPI) => {
    //00002a3d-0000-1000-8000-00805f9b34f3
    const command = params.command;
    //to base64
    const commandBase64 = Buffer.from(command).toString('base64');
    bleManager.writeCharacteristicWithResponseForDevice(device.id, '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34f3', commandBase64).then((characteristic) => {
        if (characteristic === null) {
            console.log("keybotCommand Characteristic not found");
            return;
        }
        let status = Buffer.from(characteristic.value!, 'base64').toString('ascii');
        console.log("keybotCommand: " + status);
        return status;
    }
    ).catch((error) => {

            console.log("keybotCommand error: " + error);
            return error;
        }
    );
});

    
export const disconnectDevice = createAsyncThunk('ble/disconnectDevice', async (_, thunkAPI) => {
    try{
    console.log('Disconnecting')
    if (device) {
        const isDeviceConnected = await device.isConnected();
        if (isDeviceConnected) {

            //cansel all listeners
            //batteryLevel keyBotState midSensorsStatus log 
            bleManager.cancelTransaction('batteryLevel');
            bleManager.cancelTransaction('keyBotState');
            bleManager.cancelTransaction('midSensorsStatus');
            bleManager.cancelTransaction('log');

            console.log('Disconnecting device');
            await device.cancelConnection();
            return { isSuccess: true }
        }
        else {
            console.log('Device is not connected');
            return { isSuccess: false }
            //throw new Error('No device connected');
        }
    }
    else {
        console.log('Device is undefined');
        throw new Error('Device is undefined.')
    }
}
    catch (error: any) {
        console.log('Disconnecting error: ' + error);
        throw new Error(error.toString);
    }
});
const initialState: bleSliceInterface = {
    use_demo_device: false,
    adapterState: 'Unknown',
    deviceConnectionState: { status: ConnectionState.DISCONNECTED, error: '' },
    deviceScan: { devices: [], status: NetworkState.PENDING, error: '' },
    locationPermission: null,
    connectedDevice: null,
    logs: [],
    sensorStatus: { status: SensorState.PENDING, error: '' },
    midSensorsStatus: {sensor_1_status:MidSensorState.PENDING, sensor_2_status:MidSensorState.PENDING, error: ''},
    keyBotState: { status: KeyBotState.KEYBOT_STATE_IDLE, error: '',text:'' },
    batteryLevel: { level: 0.0, text: 'waiting' },
};
const bleSlice = createSlice({
    name: 'ble',
    initialState,
    reducers: {
        setDemoMode(state, action) {
            const { use_demo_device } = action.payload;
            state.use_demo_device = use_demo_device;
        },
        setAdapterState(state, action) {
            const { adapterState } = action.payload;
            state.adapterState = adapterState;
        },
        setLocationPermissionStatus(state, action) {
            const { status } = action.payload;
            state.locationPermission = status;
        },
        setConnectedDevice(state, action) {
            const { device } = action.payload;
            state.connectedDevice = device;
        },

        setConnectionState(state, action) {
            const { status} = action.payload;
            state.deviceConnectionState = {...state.deviceConnectionState, status: status};
        },

        addScannedDevice(state, action) {
            const { device } = action.payload;
            const existingDevices = state.deviceScan.devices.filter(existingDevice => device.id !== existingDevice?.id);
            const updatedDevices = [device, ...existingDevices];
            const sorted = updatedDevices.sort((a, b) => {
                a.rssi = a.rssi || -100;
                b.rssi = b.rssi || -100;
                return a.rssi > b.rssi ? -1 : b.rssi > a.rssi ? 1 : 0;
            });
            state.deviceScan.devices = sorted;
        },
        clearScannedDevices(state, action) {
            state.deviceScan = { devices: [], status: NetworkState.PENDING, error: '' };
        },
        stopDeviceScan(state, action) {
            bleManager.stopDeviceScan();
        },
        addLog: (state, action) => {
            state.logs.push(action.payload);
            if (state.logs.length > 200) {
              state.logs.shift(); // Remove the oldest log if there are more than 200 logs
            }
          },
        updateKeySensorStatus(state, action) {
            const { status } = action.payload;
            if (status == "0") {
                state.sensorStatus = { status: SensorState.SENSOR_OK, error: '' };
            }
            else if (status == "1") {
                state.sensorStatus = { status: SensorState.SENSOR_ERROR, error: '' };
            }
            else {
                state.sensorStatus = { status: SensorState.SENSOR_ERROR, error: '' };
            }
        },
        updateMidSensorsStatus(state, action) {
            const { status } = action.payload;
            switch (status) {
                case "0":
                    // both sensors are released
                    state.midSensorsStatus.sensor_1_status = MidSensorState.RELEASED;
                    state.midSensorsStatus.sensor_2_status = MidSensorState.RELEASED;
                    break;
                case "1":
                    // sensor 1 is pressed
                    state.midSensorsStatus.sensor_1_status = MidSensorState.PRESSED;
                    state.midSensorsStatus.sensor_2_status = MidSensorState.RELEASED;
                    break;
                case "2":
                    // sensor 2 is pressed
                    state.midSensorsStatus.sensor_1_status = MidSensorState.RELEASED;
                    state.midSensorsStatus.sensor_2_status = MidSensorState.PRESSED;
                    break;
                case "3":
                    // both sensors are pressed
                    state.midSensorsStatus.sensor_1_status = MidSensorState.PRESSED;
                    state.midSensorsStatus.sensor_2_status = MidSensorState.PRESSED;
                    break;
                default:
                    console.warn(`Invalid status: ${status}`);
            }
        },
        updateKeyBotState(state, action) {
            const { status } = action.payload;
            switch (status) {
                case KeyBotState.KEYBOT_STATE_IDLE:
                    state.keyBotState = { status: KeyBotState.KEYBOT_STATE_IDLE, error: '' ,text:"KEYBOT_STATE_IDLE"};
        
                    break;
                case KeyBotState.KEYBOT_PRESSING_LEFT:
                    state.keyBotState = { status: KeyBotState.KEYBOT_PRESSING_LEFT, error: '' ,text:"KEYBOT_PRESSING_LEFT"};
                    break;
                case KeyBotState.KEYBOT_PRESSING_RIGHT:
                    state.keyBotState = { status: KeyBotState.KEYBOT_PRESSING_RIGHT, error: '' ,text:"KEYBOT_PRESSING_RIGHT"};
                    break;
                case KeyBotState.KEYBOT_RETURNING_TO_CENTER_FROM_LEFT:
                    state.keyBotState = { status: KeyBotState.KEYBOT_RETURNING_TO_CENTER_FROM_LEFT, error: '' ,text:"KEYBOT_RETURNING_TO_CENTER_FROM_LEFT"};
                    break;
                case KeyBotState.KEYBOT_RETURNING_TO_CENTER_FROM_RIGHT:
                    state.keyBotState = { status: KeyBotState.KEYBOT_RETURNING_TO_CENTER_FROM_RIGHT, error: '' ,text:"KEYBOT_RETURNING_TO_CENTER_FROM_RIGHT"};
                    break;

                case KeyBotState.KEYBOT_ERROR_PRESSING_LEFT:
                    state.keyBotState = { status: KeyBotState.KEYBOT_ERROR_PRESSING_LEFT,
                         error: 'KeySignal not detected',text:"KEYBOT_ERROR_PRESSING_LEFT" };
                    break;
                case KeyBotState.KEYBOT_ERROR_PRESSING_RIGHT:
                    state.keyBotState = { status: KeyBotState.KEYBOT_ERROR_PRESSING_RIGHT,
                            error: 'KeySignal not detected',text:"KEYBOT_ERROR_PRESSING_RIGHT" };

                    break;

                case KeyBotState.KEYBOT_ERROR_RETURNING_TO_CENTER_FROM_LEFT:
                    state.keyBotState = { status: KeyBotState.KEYBOT_ERROR_RETURNING_TO_CENTER_FROM_LEFT,
                        error: 'Limit sensor wasn\'t triggered',text:"KEYBOT_ERROR_RETURNING_TO_CENTER_FROM_LEFT" };

                    break;
                case KeyBotState.KEYBOT_ERROR_RETURNING_TO_CENTER_FROM_RIGHT:
                    state.keyBotState = { status: KeyBotState.KEYBOT_ERROR_RETURNING_TO_CENTER_FROM_RIGHT,
                        error: 'Limit sensor wasn\'t triggered',text:"KEYBOT_ERROR_RETURNING_TO_CENTER_FROM_RIGHT" };
                    break;
                case KeyBotState.KEYBOT_STATE_EMERGENCY_RESET:
                    state.keyBotState = { status: KeyBotState.KEYBOT_STATE_EMERGENCY_RESET, error: '' ,text:"KEYBOT_STATE_EMERGENCY_RESET"};
                    break;

                case KeyBotState.KEYBOT_STATE_CENTERING:
                    state.keyBotState = { status: KeyBotState.KEYBOT_STATE_CENTERING, error: '' ,text:"KEYBOT_STATE_CENTERING"};
                    break;

                case KeyBotState.KEYBOT_ERROR_CENTERING:
                    state.keyBotState = { status: KeyBotState.KEYBOT_ERROR_CENTERING,
                        error: 'Limit sensor wasn\'t triggered',text:"KEYBOT_ERROR_CENTERING" };

                    break;
                    

                default:
                    console.warn(`Invalid state: ${status}`);   
                    
                
            }

            console.log("updateKeyBotState",state.keyBotState);
        },
        updateBatteryLevel(state, action) {
            const { batteryLevel } = action.payload;
            console.log("updateBatteryLevel",batteryLevel);
            state.batteryLevel={
                level: batteryLevel,
                text: `${batteryLevel}%`,
            }
        }
    },
    extraReducers(builder) {
        builder
            .addCase(connectDeviceById.pending, (state, action) => {
                state.deviceConnectionState.status = ConnectionState.SEARCHING;
                state.deviceConnectionState.error = '';
            })
            .addCase(connectDeviceById.fulfilled, (state, action: any) => {
                state.deviceConnectionState.status = ConnectionState.READY;
                const device = action.payload;
                state.connectedDevice = device;
            })
            .addCase(connectDeviceById.rejected, (state, action) => {

                console.log("connectDeviceById.rejected",action.error.message);
                //TODO BETTER ERROR HANDLING
                if (action.error.message === NetworkState.CANCELED) {
                    state.deviceConnectionState.status = ConnectionState.DISCONNECTED;
                    state.deviceConnectionState.error = action.error.message;
                } else {
                    state.deviceConnectionState.status = ConnectionState.ERROR;
                    state.deviceConnectionState.error = action.error.message ?? '';
                }
            })
            .addCase(disconnectDevice.pending, (state, action) => {
                state.deviceConnectionState.status = ConnectionState.DISCONNECTING;
                state.deviceConnectionState.error = '';
            })
            .addCase(disconnectDevice.fulfilled, (state, action: any) => {
                state.deviceConnectionState.status = ConnectionState.DISCONNECTED;
                state.connectedDevice = null;
            })
            .addCase(disconnectDevice.rejected, (state, action) => {
                console.log("disconnectDevice.rejected",action.error.message);
                if (action.error.message === NetworkState.CANCELED) {
                    state.deviceConnectionState.status = ConnectionState.DISCONNECTED;
                    state.deviceConnectionState.error = action.error.message;
                } else {
                    state.deviceConnectionState.status = ConnectionState.ERROR;
                    state.deviceConnectionState.error = action.error.message ?? '';
                }
                state.connectedDevice = null;
            })
        ;
    },
});
export default bleSlice.reducer;
export const { setAdapterState, setLocationPermissionStatus, setConnectedDevice, addScannedDevice, clearScannedDevices, stopDeviceScan,setDemoMode,addLog
,updateKeySensorStatus,updateMidSensorsStatus,updateKeyBotState,updateBatteryLevel,setConnectionState } = bleSlice.actions;
export const selectAdapterState = (state: RootState) => state.ble.adapterState;
export const selectConnectedDevice = (state: RootState) => state.ble.connectedDevice;
export const selectScannedDevices = (state: RootState) => state.ble.deviceScan;
export const selectBle= (state: RootState) => state.ble;
// import { createAsyncThunk, createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';
// interface BleState {
//   periphiralID: string | null;
//   error: string | null;
//   status: "disconnected" | "connecting" | "connected" | "authenticating" | "authenticated" | "ready";
//   demo: boolean;
//   log: log[];
//   deviceScan: { devices: [], status: "NetworkState.PENDING", error: '' },
// }
// type log = {
//   f: number;
//   s: number;
//   p: number;
//   m: number;
//   i: number;
// }
// import { BLEServiceInstance } from './BLEService';
// const bleService =  BLEServiceInstance;
// export const toBLEDeviceVM = (device: any) => {
//   const result = {
//       serviceUUIDs: device.serviceUUIDs,
//       isConnectable: device.isConnectable,
//       overflowServiceUUIDs: device.overflowServiceUUIDs,
//       txPowerLevel: device.txPowerLevel,
//       serviceData: device.serviceData,
//       manufacturerData: device.manufacturerData,
//       name: device.name,
//       mtu: device.mtu,
//       rssi: device.rssi,
//       solicitedServiceUUIDs: device.solicitedServiceUUIDs,
//       localName: device.localName,
//       id: device.id,
//   };
//   return result;
// };
// export interface IBLEDevice {
//   serviceUUIDs: Array<string>;
//   isConnectable: boolean;
//   overflowServiceUUIDs: Array<string>;
//   txPowerLevel: string;
//   serviceData?: any;
//   manufacturerData?: any;
//   name: string;
//   mtu: number;
//   rssi: string;
//   solicitedServiceUUIDs: Array<string>;
//   localName: string;
//   id: string;
//   _manager?: any;
// }
// const initialState: BleState = {
//   periphiralID: null,
//   error: null,
//   status: "disconnected",
//   demo: false,
//   log : [{f: 0, s: 0, p: 0, m: 0, i: 0}],
//   deviceScan: { devices: [], status: "NetworkState.PENDING", error: '' },
// };
// const stopScan = () => {
//   console.log('Stopping scan');
//   bleService.manager.stopDeviceScan();
// };
// export const scanBleDevices = createAsyncThunk<any, void, { dispatch: Dispatch, state: any }>('ble/scanBleDevices', async (payload, thunkAPI) => {
//   console.log('Starting scan');
//   try {
//     bleService.manager.startDeviceScan(null, null, async (error, scannedDevice) => {
//           if (error) {
//               console.log('startDeviceScan error: ', error);
//               throw new Error(error.toString());
//           }
//           if (scannedDevice) {
//             //check if we exceed the max number of devices
//             if (thunkAPI.getState().ble.deviceScan.devices.length > 20) {
//               thunkAPI.dispatch(stopDeviceScan({}));
//               return;
//             }
//               thunkAPI.dispatch(addScannedDevice({ device: toBLEDeviceVM(scannedDevice) }));
//           }
//       });
//   } catch (error: any) {
//       throw new Error(error.toString);
//   }
// });
// const bleSlice = createSlice({
//   name: 'ble',
//   initialState,
//   reducers: {
//   addScannedDevice(state, action) {
//       const { device } = action.payload;
//       const existingDevices = state.deviceScan.devices.filter(existingDevice => device.id !== existingDevice?.id);
//       const updatedDevices = [device, ...existingDevices];
//       const sorted = updatedDevices.sort((a, b) => {
//           a.rssi = a.rssi || -100;
//           b.rssi = b.rssi || -100;
//           return a.rssi > b.rssi ? -1 : b.rssi > a.rssi ? 1 : 0;
//       });
//       state.deviceScan.devices = sorted as any; //todo fix this
//   },
//   clearScannedDevices(state, action) {
//     state.deviceScan = { devices: [], status: "NetworkState.PENDING", error: '' };
// },
//     stopDeviceScan(state, action) {
//         bleService.manager.stopDeviceScan();
//     },
//     setPeriphiralID: (state, action: PayloadAction<string>) => {
//       state.periphiralID = action.payload;
//       console.log("setConnectedPeripheral: " + action.payload);
//     },
//     setStatus: (state, action: PayloadAction<string>) => {
//       console.log("setStatus3: " + action.payload);
//       //check if the status is valid
//       if (action.payload === "disconnected" || action.payload === "connecting" || action.payload === "connected" || action.payload === "authenticating" || action.payload === "authenticated" || action.payload === "ready") {
//         state.status = action.payload;
//       }else {
//         throw new Error("Invalid status");
//       }
//     },
//     setDemo: (state, action: PayloadAction<boolean>) => {
//       state.demo = action.payload;
//       console.log("setDemo: " + action.payload);
//     },
//     setError: (state, action: PayloadAction<string>) => {
//       state.error = action.payload;
//       console.log("setError: " + action.payload);
//     },
//     clearError: (state) => {
//       state.error = null;
//       console.log("clearError");
//     },
//     setLog: (state, action: PayloadAction<string>) => {
//       //{"f":2520.00,"s":5120.00,"p":0.95,"m":1.00,"i":3}
//       //check if the log is in the correct format
//       if (action.payload.length > 0) {
//         const log = JSON.parse(action.payload);
//         if (log.f === undefined || log.s === undefined || log.p === undefined || log.m === undefined || log.i === undefined) {
//           //do nothing
//         }else {
//           state.log.push(log as log);
//         }
//       }
//       if (state.log.length > 100) {
//         state.log.shift();
//       }
//       console.log("setLog: " + action.payload);
//     },
//   },
// });
// export const { setPeriphiralID, setError, clearError, setStatus, setLog,addScannedDevice,stopDeviceScan,clearScannedDevices } = bleSlice.actions;
// export default bleSlice.reducer;
