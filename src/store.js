import { configureStore } from "@reduxjs/toolkit";
import authSlice  from "./store/slices/auth.slice";
const reducer = {
  auth: authSlice
};

const store = configureStore({
  reducer,
});

export default store;