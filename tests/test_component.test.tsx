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
import { useLoginWalletMutation, useLazyGetAuthMsgQuery, useLazyGetMeQuery, User, AuthResponse, ParcelData, CreateParcelByWallet, useCreateParcelByWalletMutation } from '../data/api';
import { useAppDispatch, useAppSelector } from '../data/hooks';
import { AsyncThunk } from '@reduxjs/toolkit';
import { Dispatch, AnyAction } from 'redux';
import { Provider } from 'react-redux';
import { ethers } from 'ethers';


jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn(() => ({
    createClient: jest.fn(),
  })),
}));


async function setupAndLoadUser(loadFunction) {
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

    // blockchain create parcel
    const parcel = {
      nftId: "1",
      transactionHash: "0x1234567890",
      recipient_addr: clientUserData.crypto[0].wallet,
      courier_addr: courierUserData.crypto[0].wallet,
      box_did: "Keybot_000000000000"
    };
    
    const { result: createParcelResult } = renderHook(() => useCreateParcelByWalletMutation(), {
      wrapper: ({ children }) => <Provider store={courierComponent.store}>{children}</Provider>,
    });

    const parcel_respose = await act(async () => {
      const result = await createParcelResult.current[0](parcel).unwrap();
      console.log("create parcel result: ", result);
      return result;
    });

    expect(parcel_respose).not.toBeUndefined();
    expect(parcel_respose.id).not.toBeUndefined();
    




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


    




  

  


