import { configureStore } from "@reduxjs/toolkit";
import data from "./data";

let store = configureStore({
  reducer: {
    reducer: data,
  },
});

export default store;
