import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  ethPrice: {
    data: {},
    isLoading: true,
  },
  ethSupply: {
    data: {},
    isLoading: true,
  },
  transactions: [],
  blocks: [],
};

export const ethPrice = createAsyncThunk("ethPrice", async (_, thunkAPI) => {
  try {
    const response = await fetch(
      `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${process.env.ETHERSCAN_KEY}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Error Get ETH Price");
  }
});

export const ethSupply = createAsyncThunk("ethSupply", async (_, thunkAPI) => {
  try {
    const response = await fetch(
      `https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=${process.env.ETHERSCAN_KEY}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Error Get ETH Supply");
  }
});

const datas = createSlice({
  name: "Datas",
  initialState,
  reducers: {
    setTransactions: (state, { payload }) => {
      state.transactions = payload;
    },
    setBlocks: (state, { payload }) => {
      state.blocks = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ethPrice.pending, (state) => {
        state.ethPrice.isLoading = true;
      })
      .addCase(ethPrice.fulfilled, (state, { payload }) => {
        state.ethPrice.isLoading = false;
        state.ethPrice.data = payload;
      })
      .addCase(ethPrice.rejected, (state) => {
        state.ethPrice.isLoading = false;
      });
    builder
      .addCase(ethSupply.pending, (state) => {
        state.ethSupply.isLoading = true;
      })
      .addCase(ethSupply.fulfilled, (state, { payload }) => {
        state.ethSupply.isLoading = false;
        state.ethSupply.data = payload;
      })
      .addCase(ethSupply.rejected, (state) => {
        state.ethSupply.isLoading = false;
      });
  },
});

export const { setTransactions, setBlocks } = datas.actions;
export default datas.reducer;
