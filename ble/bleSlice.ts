import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';

interface BleState {
  periphiralID: string | null;
  error: string | null;
  status: "disconnected" | "connecting" | "connected" | "authenticating" | "authenticated" | "ready";
  demo: boolean;
  
}

const initialState: BleState = {
  periphiralID: null,
  error: null,
  status: "disconnected",
  demo: false,
};

const bleSlice = createSlice({
  name: 'ble',
  initialState,
  reducers: {
    setPeriphiralID: (state, action: PayloadAction<string>) => {
      state.periphiralID = action.payload;
      console.log("setConnectedPeripheral: " + action.payload);
    },
    setStatus: (state, action: PayloadAction<string>) => {

      console.log("setStatus3: " + action.payload);

      //check if the status is valid
      if (action.payload === "disconnected" || action.payload === "connecting" || action.payload === "connected" || action.payload === "authenticating" || action.payload === "authenticated" || action.payload === "ready") {
        state.status = action.payload;
      }else {
        throw new Error("Invalid status");
      }
    },
    setDemo: (state, action: PayloadAction<boolean>) => {
      state.demo = action.payload;
      console.log("setDemo: " + action.payload);
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      console.log("setError: " + action.payload);
    },
    clearError: (state) => {
      state.error = null;
      console.log("clearError");
    },


  },
});

export const { setPeriphiralID, setError, clearError, setStatus } = bleSlice.actions;
export default bleSlice.reducer;



