import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";
// import AuthServices from "../services/AuthServices";

export const login = createAsyncThunk("/auth/login", async (values) => {
  const res = await AuthServices.loginApi(values);
  return res.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: false,
    logIn: false,
    meData: {
      name: "John Doe",
      email: "johndoe@example.com",
      role: "User",
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.logIn = true;
        localStorage.setItem("auth_access_token", action.payload.token);
        toast.success(action.payload.message);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.logIn = false;
        toast.error(action.error.message);
      });
  },
});

const { reducer } = authSlice;
export default reducer;
