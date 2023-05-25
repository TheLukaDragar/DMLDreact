/**
 * @jest-environment jsdom
 */
import 'whatwg-fetch';
import React from 'react'

import { act, fireEvent, screen, waitFor } from '@testing-library/react'
// We're using our own custom render function and not RTL's render.
import { renderWithProviders } from '../utils/test-utils'
import TestComponent, { loginPassed } from './test_component'
import '@testing-library/jest-dom';
import "whatwg-fetch"
import { loadDemoClientWallet } from '../data/secure';
import { useLoginWalletMutation, useLazyGetAuthMsgQuery } from '../data/api';
import { useAppDispatch, useAppSelector } from '../data/hooks';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn(() => ({
    createClient: jest.fn(),
  })),
}));



test('should render "Test Component" text', () => {
    renderWithProviders(<TestComponent />)
  
    // Check that it renders "Test Component" text
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  })

test('should login', async () => {

  const store = renderWithProviders(<TestComponent />)

  await act(async () => {
    await loadDemoClientWallet()(store.store.dispatch, store.store.getState, undefined);
  });



  expect(store.store.getState().secure.is_wallet_setup).toBe(true);

  const loginButton = screen.getByText('Login');
  expect(loginButton).toBeInTheDocument();
  fireEvent.click(loginButton);

  
  await waitFor(() => expect(loginPassed).toHaveBeenCalled(), { timeout: 20000 });





  expect(store.store.getState().secure.userData.token).not.toBeUndefined();
  expect(store.store.getState().secure.userData.token).not.toBeNull();


  console.log(store.store.getState().secure.userData.token);
  console.log(store.store.getState().secure.keyChainData?.privateKey!);
  
});

    


