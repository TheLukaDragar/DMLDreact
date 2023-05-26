/**
 * @jest-environment jsdom
 */
import { configureStore } from '@reduxjs/toolkit';
import { AnyAction } from 'redux';
import blockchainSlice, { isWhitelisted, setPrivateKey } from '../blockchain';
jest.mock('expo-constants', () => ({
    expoConfig: {
        extra: {
            RPCUrl: 'https://bellecour.iex.ec',
            reputationSCAddress: '0x883957F3bc621DEc82d4522379E67bA4a8118820',
            parcelNFTSCAddress: '0xDD2EBb698bfCcD711E3Cc352a9E3C17b484fB339',
        },
    },
}));
describe('blockchainSlice', () => {
    let store: ReturnType<typeof configureStore>;

    const privateKey_Courier = "0x6a3c63737cd800c0367abfb24d6f845de550907257ef1e3786583534c1440d1f";
    const privateKey_Client = "0xdbaa334fb6984b34062ff704300dd7dc47b6101f0feaf875d361dbe7e5f07786";
    const privateKey_UnWhitelisted = "0x143c63737cd805c0367abfb24d6f845de550907257ef1e3786583534c1440d1f";

    beforeEach(() => {
        // setup blockchain slice
        store = configureStore({
            reducer: {
                blockchain: blockchainSlice,
            },
        });
    });

    async function setPrivateKeyAndCheckIt(privateKey: string) {
        await store.dispatch(setPrivateKey(privateKey) as unknown as AnyAction);

        const state: any = store.getState();
        const privateKeyInStore = state.blockchain.privateKey;

        expect(privateKeyInStore).toBe(privateKey);
    }

    it('sets the private key correctly in the store', async () => {
        await setPrivateKeyAndCheckIt(privateKey_Client);
    });

    async function checkWhitelistedStatus(privateKey: string, expectedStatus: boolean) {
        await store.dispatch(setPrivateKey(privateKey) as unknown as AnyAction);

        const result = await store.dispatch(isWhitelisted() as unknown as AnyAction).unwrap();

        expect(result).toBe(expectedStatus);
    }

    it('confirms that a whitelisted client is recognized as whitelisted', async () => {
        await checkWhitelistedStatus(privateKey_Client, true);
    });

    it('confirms that a whitelisted courier is recognized as whitelisted', async () => {
        await checkWhitelistedStatus(privateKey_Courier, true);
    });

    it('confirms that an unwhitelisted address is recognized as not whitelisted', async () => {
        await checkWhitelistedStatus(privateKey_UnWhitelisted, false);
    });

    
});
