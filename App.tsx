import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import { Provider as PaperProvider } from 'react-native-paper';

import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { Provider } from 'react-redux';
import {store} from './data/store';
import BLEService from './ble/BLEService';
import React from 'react';

const persistor = persistStore(store);
const bleService = BLEService.getInstance();

bleService.init();

export const BLEServiceContext = React.createContext(bleService);

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

 

  //use loading state to show splash screen in persistor

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      
      <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      <BLEServiceContext.Provider value={bleService}>
      <PaperProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </PaperProvider>
      </BLEServiceContext.Provider>
      </PersistGate>
      </Provider>

    );
  }
}
