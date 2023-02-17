import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';

interface BleState {
  periphiralID: string | null;
  error: string | null;
  status: "disconnected" | "connecting" | "connected" | "authenticating" | "authenticated" | "ready";
  demo: boolean;
  log: log[];
  
}
       //{"f":2520.00,"s":5120.00,"p":0.95,"m":1.00,"i":3}

type log = {
  f: number;
  s: number;
  p: number;
  m: number;
  i: number;
}



const initialState: BleState = {
  periphiralID: null,
  error: null,
  status: "disconnected",
  demo: false,
  log : [{f: 0, s: 0, p: 0, m: 0, i: 0}],
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
    setLog: (state, action: PayloadAction<string>) => {
      
      //{"f":2520.00,"s":5120.00,"p":0.95,"m":1.00,"i":3}
      //check if the log is in the correct format
      if (action.payload.length > 0) {
        const log = JSON.parse(action.payload);
        if (log.f === undefined || log.s === undefined || log.p === undefined || log.m === undefined || log.i === undefined) {
          //do nothing
        }else {
          state.log.push(log as log);
        }
      }


  


      if (state.log.length > 100) {
        state.log.shift();
      }

      console.log("setLog: " + action.payload);
      
    }



  },
});

export const { setPeriphiralID, setError, clearError, setStatus, setLog } = bleSlice.actions;
export default bleSlice.reducer;



