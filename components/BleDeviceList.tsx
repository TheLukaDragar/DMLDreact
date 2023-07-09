import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../data/hooks';
import {
    connectDeviceById, scanBleDevices,
    selectAdapterState,
    selectConnectedDevice,
    selectScannedDevices, stopDeviceScan
} from '../ble/bleSlice';
import { IBLEDevice } from '../ble/bleSlice.contracts';
import { Text, View } from '../components/Themed';
import { ActivityIndicator, Button } from 'react-native-paper';
import Layout from'../constants/Layout';

//... DeviceItem component here



interface DeviceItemProps {
    device: IBLEDevice | null
    onDevicePress?: (device: IBLEDevice) => void
}

const DeviceItem = (props: DeviceItemProps) => {
    const { device, onDevicePress } = props;
    const [isConnecting, setIsConnecting] = useState(false);
    const connectedDevice = useAppSelector(selectConnectedDevice)

    const connectHandler = async () => {
        if (isConnecting) return;
        if (device?.id){
            setIsConnecting(true);
            if (onDevicePress) {
                onDevicePress(device);
            }
            setIsConnecting(false);
        }
    }

    return (
        <TouchableOpacity style={{  width: Layout.window.width*0.8}} onPress={connectHandler}>
        <Text style={{ paddingVertical: 10,
        color: connectedDevice?.id === device?.id ? 'green' : 'white'
        
        
        }}>{device?.name + ' ' + device?.id}</Text>
        </TouchableOpacity>
    )
}

const BLEDeviceList = ({ onDevicePress, shouldScan, ...props
 }: { onDevicePress?: (device: IBLEDevice) => void , shouldScan: boolean}) => {
    const [buttonText, setButtonText] = useState('Start Scan');
    const adapterState = useAppSelector(selectAdapterState);
    const scannedDevices = useAppSelector(selectScannedDevices).devices;
    const dispatch = useAppDispatch();

    
    useEffect(() => {
        console.log('shouldScan', shouldScan);
        if (shouldScan){
            dispatch(scanBleDevices());
            setButtonText('Stop Scan');

        }
          
        else {
            // stop scan function here
            dispatch(stopDeviceScan({}));
            setButtonText('Start Scan');
        }
        
        
    }, [shouldScan]);

    return (
        <>
            <ActivityIndicator animating={shouldScan} />
            
            <FlatList
                style={{ height: '100%' }}
                contentContainerStyle={{ width: '100%', justifyContent: 'center' }}
                data={scannedDevices}
                renderItem={({ item }) => (
                    <DeviceItem device={item} onDevicePress={onDevicePress} />
                )}
            />
            {/* <Button onPress={scanPressHandler} loading={isScanning} style={{ marginBottom: 10 }} mode="contained">{buttonText}</Button> */}
        </>
    );
};

export default BLEDeviceList;
