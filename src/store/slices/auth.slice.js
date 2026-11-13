import { AUTH_CONFIG } from "@config/auth.config";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "@store/api/auth.api";
import { clearAuthStorage, isLoggedIn } from "@utils/auth.utils";
import { toast } from "sonner";

const logIn = isLoggedIn();

export const login = createAsyncThunk("/auth/login", async (values) => {
  const res = await authApi.logInApi(values);
  return res.data;
});
export const fetchMe = createAsyncThunk("/auth/me", async () => {
  const res = await authApi.meApi();
  return res.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    logIn,
    isLoggingIn: false,
    ifFetchingMeData: false,
    meData: null,
  },
  reducers: {
    logout: (state) => {
      state.logIn = false;
      state.meData = null;
      clearAuthStorage();
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.logIn = true;
        const { accessToken, refreshToken, user, message } =
          action.payload;
        const { remember } = action.meta.arg;
        const storage = remember ? localStorage : sessionStorage;

        storage.setItem(AUTH_CONFIG.ACCESS_TOKEN, accessToken);
        storage.setItem(AUTH_CONFIG.REFRESH_TOKEN, refreshToken);

        if (user?.companyId) {
          storage.setItem(AUTH_CONFIG.COMPANY_ID, user.companyId);
        }

        toast.success(message || "Login successful!");
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoggingIn = false;
        state.logIn = false;
        toast.error(action.error.message);
      })
      .addCase(fetchMe.pending, (state) => {
        state.ifFetchingMeData = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.ifFetchingMeData = false;
        state.meData = action.payload;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.ifFetchingMeData = false;
        toast.error(action.error.message);
      });
  },
});

export const { logout } = authSlice.actions;
const { reducer } = authSlice;
export default reducer;
