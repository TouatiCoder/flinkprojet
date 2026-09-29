// features/global/globalSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GlobalState {
    Updating: boolean;
    Deleteting: boolean;
    // Add other global state properties as needed
}

const initialState: GlobalState = {
    Updating: false,
    Deleteting: false,
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setUpdating: (state, action: PayloadAction<boolean>) => {
      state.Updating = action.payload;
    },
    setDeleteting: (state, action: PayloadAction<boolean>) => {
      state.Deleteting = action.payload;
    },
  },
});

// Action creators
export const { 
    setUpdating, 
    setDeleteting,
} = globalSlice.actions;

export default globalSlice.reducer;