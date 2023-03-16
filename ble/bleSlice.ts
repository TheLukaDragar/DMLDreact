



import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { BleManager, Device } from 'react-native-ble-plx';
import { RootState } from '../data/store';
import { bleSliceInterface, connectDeviceByIdParams, NetworkState, toBLEDeviceVM } from './bleSlice.contracts';

const bleManager = new BleManager();
let device: Device;

const stopScan = () => {
    console.log('Stopping scan');
    bleManager.stopDeviceScan();
};

export const scanBleDevices = createAsyncThunk('ble/scanBleDevices', async (_, thunkAPI) => {
    try {
        bleManager.startDeviceScan(null, null, async (error, scannedDevice) => {
            if (error) {
                console.log('startDeviceScan error: ', error);
                throw new Error(error.toString());
            }
            if (scannedDevice && scannedDevice.name?.includes('BLE_SERVER')) {
                thunkAPI.dispatch(addScannedDevice({ device: toBLEDeviceVM(scannedDevice) }));
            }
        });
    } catch (error: any) {
        throw new Error(error.toString);
    }
});

export const connectDeviceById = createAsyncThunk('ble/connectDeviceById', async (params: connectDeviceByIdParams, thunkAPI) => {
    const { id } = params;

    try {
        stopScan();
        device = await bleManager.connectToDevice(id);
        const deviceChars = await bleManager.discoverAllServicesAndCharacteristicsForDevice(id);
        const services = await deviceChars.services();
        const serviceUUIDs = services.map(service => service.uuid);
        return toBLEDeviceVM({ ...device, serviceUUIDs });
    } catch (error: any) {
        throw new Error(error.toString);
    }
});

export const disconnectDevice = createAsyncThunk('ble/disconnectDevice', async (_, thunkAPI) => {
    console.log('Disconnecting')
    if (device) {
        const isDeviceConnected = await device.isConnected();
        if (isDeviceConnected) {
            console.log('Disconnecting device');
            await device.cancelConnection();
            return { isSuccess: true }
        }
        else {
            throw new Error('No device connected');
        }
    }
    else {
        throw new Error('Device is undefined.')
    }
});

const initialState: bleSliceInterface = {
    adapterState: 'Unknown',
    deviceConnectionState: { status: NetworkState.PENDING, error: '' },
    deviceScan: { devices: [], status: NetworkState.PENDING, error: '' },
    locationPermission: null,
    connectedDevice: null,
};

const bleSlice = createSlice({
    name: 'ble',
    initialState,
    reducers: {
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
    },
    extraReducers(builder) {
        builder
            .addCase(connectDeviceById.pending, (state, action) => {
                state.deviceConnectionState.status = NetworkState.LOADING;
                state.deviceConnectionState.error = '';
            })
            .addCase(connectDeviceById.fulfilled, (state, action: any) => {
                state.deviceConnectionState.status = NetworkState.SUCCESS;
                const device = action.payload;
                state.connectedDevice = device;
            })
            .addCase(connectDeviceById.rejected, (state, action) => {
                if (action.error.message === NetworkState.CANCELED) {
                    state.deviceConnectionState.status = NetworkState.CANCELED;
                    state.deviceConnectionState.error = action.error.message;
                } else {
                    state.deviceConnectionState.status = NetworkState.ERROR;
                    state.deviceConnectionState.error = action.error.message ?? '';
                }
            })
            .addCase(disconnectDevice.pending, (state, action) => {
                state.deviceConnectionState.status = NetworkState.LOADING;
                state.deviceConnectionState.error = '';
            })
            .addCase(disconnectDevice.fulfilled, (state, action: any) => {
                state.deviceConnectionState.status = NetworkState.CANCELED;
                state.connectedDevice = null;
            })
            .addCase(disconnectDevice.rejected, (state, action) => {
                if (action.error.message === NetworkState.CANCELED) {
                    state.deviceConnectionState.status = NetworkState.CANCELED;
                    state.deviceConnectionState.error = action.error.message;
                } else {
                    state.deviceConnectionState.status = NetworkState.ERROR;
                    state.deviceConnectionState.error = action.error.message ?? '';
                }
                state.connectedDevice = null;
            })
        ;
    },
});

export default bleSlice.reducer;

export const { setAdapterState, setLocationPermissionStatus, setConnectedDevice, addScannedDevice, clearScannedDevices, stopDeviceScan } = bleSlice.actions;

export const selectAdapterState = (state: RootState) => state.ble.adapterState;
export const selectConnectedDevice = (state: RootState) => state.ble.connectedDevice;
export const selectScannedDevices = (state: RootState) => state.ble.deviceScan;






















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



