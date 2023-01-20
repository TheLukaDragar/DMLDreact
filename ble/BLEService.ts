import {
  BleError,
  BleManager, Device,
} from 'react-native-ble-plx';



import {PermissionsAndroid, Platform} from 'react-native';
import * as thisDevice from 'expo-device';
import { Buffer } from 'buffer'
import CryptoES from 'crypto-es';

type VoidCallback = (result: boolean) => void;


class BLEService {
  
  
  
  manager: BleManager;
  disconnectedLister: any;

  demo = false
  private static instance: BLEService | null = null;

  private permissionsGranted = false;
  private connectedPeripheralId: string | null = null;




  constructor() {
    this.manager = new BleManager(); //TODO: restore state handler for android
    console.log("BLEService constructor");
    BLEService.instance = this;

  }

  static getInstance(): BLEService {
    return BLEService.instance? BLEService.instance : new BLEService();  
  }

  
  

  async connect(peripheralId: string) {

    if (this.demo) {
      //TODO: set demo device id
    }

    if (this.permissionsGranted === false) {
      throw new Error("Permissions not granted");
    }
    if (this.manager === null) {
      throw new Error("BLE Manager not initialized");
    }
    //check if we are already connected
    let connected = await this.manager.isDeviceConnected(peripheralId);
    if (connected) {
      console.log("Already connected");
      throw new Error("Already connected");
    }
    



    
    let device = await this.manager.connectToDevice(peripheralId).catch((error) => {
      console.log("connectToDevice error: " + error);
      throw new Error(error);

    });

    if (device === null) {
      throw new Error("Device not found");
    }

    this.connectedPeripheralId = peripheralId;
    console.log("connectedPeripheralId: " + this.connectedPeripheralId);

   


    console.log("connected");
    console.log(device.id);
    console.log(device.name);
    console.log(device.localName);
    console.log(device.manufacturerData);
    console.log(device.serviceData);
    console.log(device.serviceUUIDs);
    console.log(device.rssi);
    console.log(device.txPowerLevel);
    console.log(device.isConnectable);

    
    this.disconnectedLister = this.manager.onDeviceDisconnected(this.connectedPeripheralId!,this.onDeviceDisconnected);
    console.log("onDeviceDisconnected listener added");
    
    


    await device.discoverAllServicesAndCharacteristics()

    let services = await device.services();
    console.log("services");
    //get c
    for (let i = 0; i < services.length; i++) {

      console.log("service: " + i + " " + services[i].uuid);
     
      console.log(services[i].isPrimary);
      let characteristics = await services[i].characteristics();
      for (let j = 0; j < characteristics.length; j++) {
        console.log("characteristic: " + j + " " + characteristics[j].uuid);
        console.log("Readable: " + characteristics[j].isReadable);
        console.log("Writable: " + characteristics[j].isWritableWithResponse);
        console.log("WritableWithoutResponse: " + characteristics[j].isWritableWithoutResponse);
        console.log("Notifiable: " + characteristics[j].isNotifiable);
        console.log("Notifying: " + characteristics[j].isNotifying);
        

        if (characteristics[j].isReadable) {
          let value = await characteristics[j].read();
          console.log("value: " + value.value);
        }



        
       
      }
    }

    

    //get challenge from box
    let characteristic = await this.manager.readCharacteristicForDevice(this.connectedPeripheralId? this.connectedPeripheralId : '', '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34fa').catch((error) => {
      console.log("readCharacteristicForDevice error: " + error);
      throw new Error(error);

    });

    if (characteristic === null) {
      throw new Error("Characteristic not found");
    }
    let value = characteristic.value;
    let challenge = Buffer.from(value!, 'base64').toString('ascii').substring(0, 16);
    console.log("challenge: " + challenge);

    return challenge;

    //set listener for ble status
    // * @example
    //  * const transactionId = 'monitor_battery';
    // *
    // * // Monitor battery notifications
    // * manager.monitorCharacteristicForDevice(
    // *   device.id, '180F', '2A19',
    // *   (error, characteristic) => {
    // *   // Handle battery level changes...
    // * }, transactionId);
    // *
    // * // Cancel after specified amount of time
    // * setTimeout(() => manager.cancelTransaction(transactionId), 2000);


    // this.connectionLister= this.manager.onDeviceDisconnected(this.connectedPeripheralId? this.connectedPeripheralId : '', (error, device) => {
    //   console.log("onDeviceDisconnected");
    //   console.log(error);
    // });


    
  }

  onDeviceDisconnected(error: any, device: any) {
    console.log("onDeviceDisconnected");
  
    this.connectedPeripheralId = null;
    this.disconnectedLister?.remove();
    this.disconnectedLister = null;

    
  }

  //onDisconnect interface for other classes to listen to return this.disconnectedLister
  onDisconnect( callback: (error: any, device: any) => void) {
    
    this.manager.onDeviceDisconnected(this.connectedPeripheralId!, callback);

    
  }

  
  
  


  solveChallenge(challenge: string ) {
    let key = "cQfTjWnZr4u7x!z%"

    const key128Bits = CryptoES.enc.Utf8.parse(key);
    //ecb mode
    const encrypted = CryptoES.AES.encrypt(challenge, key128Bits, { mode: CryptoES.mode.ECB, padding: CryptoES.pad.NoPadding });
    //to hex
    let encryptedHex = encrypted.ciphertext.toString(CryptoES.enc.Hex);
    //to uppercase
    encryptedHex = encryptedHex.toUpperCase();
    console.log("encrypted: " + encryptedHex);
    return encryptedHex;

  }
  
  async authenticate(solution: string) {

    let message = solution.substring(0, 16);
  
    let encoded = Buffer.from(message).toString('base64');
    console.log("encoded: " + encoded);


    let writeCharacteristic = await this.manager.writeCharacteristicWithResponseForDevice(this.connectedPeripheralId? this.connectedPeripheralId : '', '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34fb', encoded);
    if (writeCharacteristic === null) {
      throw new Error("Characteristic not found");

    }
    console.log("characteristic: " + writeCharacteristic.uuid);

    //write the second part of the message
    message = solution.substring(16, 32);

    //encode to base64
    encoded = Buffer.from(message).toString('base64');
    console.log("encoded 2: " + encoded);

    writeCharacteristic = await this.manager.writeCharacteristicWithResponseForDevice(this.connectedPeripheralId? this.connectedPeripheralId : '', '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34fb', encoded);
    if (writeCharacteristic === null) {
      throw new Error("Characteristic not found");
    }

    //read the auth characteristic
    let readCharacteristic = await this.manager.readCharacteristicForDevice(this.connectedPeripheralId? this.connectedPeripheralId : '', '00001815-0000-1000-8000-00805f9b34fb', '00002a3d-0000-1000-8000-00805f9b34fc');
    if (readCharacteristic === null) {
      throw new Error("Characteristic not found");
    }
    let value = readCharacteristic.value;
    let auth = Buffer.from(value!, 'base64').toString('ascii');
    console.log("authenticated: " + auth? "true" : "false");
    
    if(auth === '1') {
      return true;
    }else {
      return false;
      
    }

  }
 
  async disconnect() {

    console.log("disconnecting");

    if(this.connectedPeripheralId === null) {
      console.log("not connected");
      return;
    }
  

    await this.manager.cancelDeviceConnection(this.connectedPeripheralId? this.connectedPeripheralId : '').catch((error) => {
      console.log("error disconnecting: " + error);
    }
    );
    
  

  }
  async init() {
    //check permissions
   await this.requestPermissions((result) => {
      this.permissionsGranted = result;
      if (result) {
        console.log("Permissions granted");
      }else {
        console.log("Permissions denied");
      }

    }
    );

    if(!this.permissionsGranted) {
      throw new Error("Permissions not granted");
    }

  
    
  }
  

  requestPermissions = async (cb: VoidCallback) => {
    if (Platform.OS === 'android') {
      
      const apiLevel =  thisDevice.platformApiLevel;
      //null check for apiLevel
      //alert(apiLevel);
      console.log("apiLevel: " + apiLevel);


      if (apiLevel != null && apiLevel < 31) {  //TODO apiLevel is null on my device
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth Low Energy requires Location',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        ).catch(err => {
          console.log(err);
        });

        cb(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {

        if (apiLevel == null) {
          console.log("apiLevel is null");
        }
        // Android 12+ requires multiple permissions
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        const isGranted =
          result['android.permission.BLUETOOTH_CONNECT'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED;

        cb(isGranted);
      
      }
    } else {
      //ios permissions are handled by the library itself so we just return true here 
      cb(true);
    }
  };
}

export default BLEService;
