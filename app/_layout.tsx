import {ReactNode, useEffect} from 'react';
import {Slot, Stack, SplashScreen, usePathname, useSearchParams, useSegments, useRouter} from 'expo-router';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { Provider } from 'react-redux';
import {store} from '../data/store';
import useCachedResources from '../hooks/useCachedResources';
import useColorScheme from '../hooks/useColorScheme';
import { StatusBar } from "expo-status-bar";
import { RootSiblingParent } from 'react-native-root-siblings';

import { Provider as PaperProvider } from 'react-native-paper';
//theme provider
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
  useTheme,
  NavigationContainer
} from "@react-navigation/native";
import React from 'react';

import { ProviderAuth } from '../auth/provider';
import BLEManager from '../components/BLEManager/BLEManager';


const persistor = persistStore(store);


export default function RootLayout(): ReactNode {
  //const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  const pathname = usePathname();
  const params = useSearchParams();

  



  useEffect(() => {
    console.log('pathname changed', pathname);

    //here we can remeber the last page and redirect to it 


  }, [pathname, params]);




  // if (!isLoadingComplete) {
  //   return <SplashScreen />;
  // } else {
  return (

    
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

    <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ProviderAuth>
    <PaperProvider>
    <RootSiblingParent>  
    <BLEManager/>
      <Slot/>
      <StatusBar />

    </RootSiblingParent>
    </PaperProvider>
    </ProviderAuth>
    
    </PersistGate>
    </Provider>

    </ThemeProvider>
  
  );
  
}


