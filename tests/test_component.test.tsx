/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import React from 'react'

import { act, fireEvent, screen, waitFor ,renderHook} from '@testing-library/react'
// We're using our own custom render function and not RTL's render.
import { renderWithProviders } from '../utils/test-utils'
import TestComponent, { getUserDataPassed, loginPassed } from './test_component'
import '@testing-library/jest-dom';
import "whatwg-fetch"

import { KeyChainData, loadDemoClientWallet, loadDemoCourierWallet } from '../data/secure';
import { useLoginWalletMutation, useLazyGetAuthMsgQuery, useLazyGetMeQuery, User, AuthResponse, ParcelData, CreateParcelByWallet, useCreateParcelByWalletMutation, useLazyGetBoxAccessKeyQuery, useLazyGetBoxesQuery, useLazyGetDoesUserHavePermissionToBoxQuery, PreciseLocation, useSetBoxPreciseLocationMutation, useLazyGetBoxPreciseLocationQuery, isFetchBaseQueryError, isErrorWithMessage } from '../data/api';
import { useAppDispatch, useAppSelector } from '../data/hooks';
import { AsyncThunk } from '@reduxjs/toolkit';
import { Dispatch, AnyAction } from 'redux';
import { Provider } from 'react-redux';
import { ethers } from 'ethers';
import { connectDeviceById, demoDevice, getChallenge, setDemoMode } from '../ble/bleSlice';


jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn(() => ({
    createClient: jest.fn(),
  })),
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
      extra: {
        API_URL: "https://4gkntp89fl.execute-api.eu-central-1.amazonaws.com/development/",
        reputationSCAddress: "0x883957F3bc621DEc82d4522379E67bA4a8118820",
        parcelNFTSCAddress: "0xDD2EBb698bfCcD711E3Cc352a9E3C17b484fB339",
        RPCUrl: "https://bellecour.iex.ec",
        use_demo_device: true,
      },
  },
}));


async function setupAndLoadUser(loadFunction: AsyncThunk<{ mnemonicPhrase: string; keyChainData: KeyChainData; }, void, { state?: unknown; dispatch?: Dispatch<AnyAction> | undefined; extra?: unknown; rejectValue?: unknown; serializedErrorType?: unknown; pendingMeta?: unknown; fulfilledMeta?: unknown; rejectedMeta?: unknown; }>) {
  const component = renderWithProviders(<TestComponent />);
  
  await act(async () => {
    const secureData = await loadFunction()(component.store.dispatch, component.store.getState, undefined).unwrap();
    expect(secureData).not.toBeUndefined();
  });

  // getMessageToSign hook
  const { result: msg } = renderHook(() => useLazyGetAuthMsgQuery(), {
    wrapper: ({ children }) => <Provider store={component.store}>{children}</Provider>,
  });
  const msgResult = await act(async () => await msg.current[0]().unwrap());

  const signer = new ethers.Wallet(component.store.getState().secure.keyChainData?.privateKey!);
  const signature = await signer.signMessage(msgResult?.message!);

  // useLoginWalletMutation
  const { result: login } = renderHook(() => useLoginWalletMutation(), {
    wrapper: ({ children }) => <Provider store={component.store}>{children}</Provider>,
  });
  const loginResult = await act(async () => await login.current[0]({
    wallet: signer.address,
    signature: signature,
    timestamp: msgResult?.timestamp!,
  }).unwrap());

  expect(loginResult).not.toBeUndefined();

  expect(loginResult).not.toBeUndefined();
  expect(loginResult.profile.crypto[0].wallet).not.toBeUndefined();
  const wallet = loginResult.profile.crypto[0].wallet;
  console.log("user wallet: ", wallet);
  console.log("user id: ", loginResult.profile.id);
  console.log("user token: ", component.store.getState().secure.userData.token);
  console.log("user: ", loginResult);

  console.log("login passed");
  
  expect(component.store.getState().secure.userData.token).not.toBeUndefined();
  expect(component.store.getState().secure.userData.token).not.toBeNull();
  
  return { component, loginResult };
}

describe('Test Scenario', () => {
  test('1. courier should create a parcel', async () => {
    const { component: courierComponent, loginResult: courierResult } = await setupAndLoadUser(loadDemoCourierWallet);
    const { component: clientComponent, loginResult: clientResult } = await setupAndLoadUser(loadDemoClientWallet);
    const courierUserData = courierResult.profile;
    const clientUserData = clientResult.profile;

    const demo_box_did="KeyBot_000000000000"


    //client get boxes that he can access

    //get list of boxes from api
    const { result: boxesResult } = renderHook(() => useLazyGetBoxesQuery(), {
      wrapper: ({ children }) => <Provider store={clientComponent.store}>{children}</Provider>,
    });

    const boxes = await act(async () => await boxesResult.current[0]().unwrap());
    expect(boxes).not.toBeUndefined();
    expect(boxes.items).not.toBeUndefined();
    expect(boxes.total).not.toBeUndefined();
    expect(boxes.items.length).toBeGreaterThan(0);
    expect(boxes.total).toBeGreaterThan(0);

    //find the box with the right did
    const box = boxes.items.find((box) => box.did === demo_box_did);
    expect(box).not.toBeUndefined();

    //confirm client can access the box useLazyGetDoesUserHavePermissionToBoxQuery
    // const { result: doesUserHavePermissionToBox } = renderHook(() => useLazyGetDoesUserHavePermissionToBoxQuery(), {
    //   wrapper: ({ children }) => <Provider store={clientComponent.store}>{children}</Provider>,
    // });


    //TODO
    // const boxAccess = await act(async () => await doesUserHavePermissionToBox.current[0](box!.id).unwrap());
    // expect(boxAccess).not.toBeUndefined();

    //update box location
    const car_location = {
      latitude: 45.767,
      longitude: 4.833,
      inaccuracy: 10,
    } as PreciseLocation;

    //SetBoxPreciseLocation
    const { result: setBoxPreciseLocationResult } = renderHook(() => useSetBoxPreciseLocationMutation(), {
      wrapper: ({ children }) => <Provider store={clientComponent.store}>{children}</Provider>,
    });

    try {
      const setBoxPreciseLocationResponse = await act(async () => {
        const result = await setBoxPreciseLocationResult.current[0]({
          boxId: box!.id,
          preciseLocation: car_location,
        }).unwrap();
        console.log("setBoxPreciseLocationResponse: ", result);
        return result;
      });

      expect(setBoxPreciseLocationResponse).not.toBeUndefined();
      expect(setBoxPreciseLocationResponse.id).not.toBeUndefined();
      expect(setBoxPreciseLocationResponse.isPrecise).toBe(true);
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        const errMsg = 'error' in err ? err.error : JSON.stringify(err.data);
        console.log('fetch error', err);
        //check if status PRECISE_LOCATION_EXISTS and if so, ignore
        if (err.status === 422) {
          console.log('PRECISE_LOCATION_EXISTS');
        }else{
          throw err;
        }



      
      } else if (isErrorWithMessage(err)) {
        console.log('error with message, ', err);
       
      }
    }
    

    



    
    





    const courier_loocation1 = {
      latitude: 45.767,
      longitude: 4.833,
      inaccuracy: 10,
    } as PreciseLocation;




    // blockchain create parcel
    const parcel = {
      nftId: "1",
      transactionHash: "0x1234567890",
      recipient_addr: clientUserData.crypto[0].wallet,
      courier_addr: courierUserData.crypto[0].wallet,
      box_did: demo_box_did,
      preciseLocation: courier_loocation1,
    } as CreateParcelByWallet ;
    
    const { result: createParcelResult } = renderHook(() => useCreateParcelByWalletMutation(), {
      wrapper: ({ children }) => <Provider store={courierComponent.store}>{children}</Provider>,
    });

    const parcel_respose = await act(async () => {
      const result = await createParcelResult.current[0](parcel).unwrap();
      console.log("create parcel result: ", result);
      return result;
    });

    expect(parcel_respose).not.toBeUndefined();
    expect(parcel_respose.id).not.toBeNull();


    // 2. courer deposits the parcel in the box

    // get location of box
    // getBoxPreciseLocation
    const { result: getBoxPreciseLocationResult } = renderHook(() => useLazyGetBoxPreciseLocationQuery(), {
      wrapper: ({ children }) => <Provider store={courierComponent.store}>{children}</Provider>,
    });

    const box_location = await act(async () => {
      const result = await getBoxPreciseLocationResult.current[0](box!.id).unwrap();
      console.log("box location: ", result);
      return result;
    });

    //check that they are not null
    expect(box_location.latitude).not.toBeNull();
    expect(box_location.longitude).not.toBeNull();
    expect(box_location.inaccuracy).not.toBeNull();

    
    
    




    //connect to the box

    


    const mac_addres = demoDevice.id;

    const ble_Device = await courierComponent.store.dispatch(connectDeviceById({
      id: mac_addres,
    }) as unknown as AnyAction).unwrap();

    expect(ble_Device).not.toBeUndefined();
    expect(ble_Device.id).not.toBeUndefined();

    //get challenge from the box
    const challenge = await courierComponent.store.dispatch(getChallenge() as unknown as AnyAction).unwrap();
    //expect string
    expect(challenge).not.toBeUndefined();
    expect(typeof challenge).toBe("string");

    //solve the challenge with the call to the api
    const { result: solveChallengeResult } = renderHook(() => useLazyGetBoxAccessKeyQuery(), {
      wrapper: ({ children }) => <Provider store={courierComponent.store}>{children}</Provider>,
    });


    const access_key = await act(async () => {
      const result = await solveChallengeResult.current[0]({
        challenge: challenge as unknown as string,
        boxId: box?.id || -1,
        //courier has to be in the box location
        preciseLocation: {
          longitude: box_location.longitude,
          latitude: box_location.latitude,
          inaccuracy: box_location.inaccuracy,
        },

      }).unwrap();
      console.log("access key result: ", result);
      return result;
    }
    );

    expect(access_key).not.toBeUndefined();
    expect(access_key.accessKey).not.toBeUndefined();
    expect(access_key.accessKey).not.toBeNull();

    //connect to the box
    





    



    


  

  }, 20000);
});








    // //getme
    // const { result: getMeResult } = renderHook(() => useLazyGetMeQuery(), {
    //   wrapper: ({ children }) => <Provider store={courierComponent.store}>{children}</Provider>,
    // });

    // await act(async () => {
    //   const getMeResultData = await getMeResult.current[0]().unwrap();
    //   console.log("get me result: ", getMeResultData);
    // });


    




  

  


