import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface User {
  email: string;
  role: string;
  token: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initializing: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  initializing: true,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:3005/api/v1/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.data.token) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("email", data.data.email);
        localStorage.setItem("role", data.data.role);
        document.cookie = `token=${data.data.token}; path=/; max-age=86400`;
        
        return data.data;
      }
      
      return rejectWithValue(data.message || "Login failed");
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuth: (state) => {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");
      const role = localStorage.getItem("role");
      
      if (token && email && role) {
        state.user = { email, role, token };
      }
      state.initializing = false;
    },
    logout: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      state.user = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { initializeAuth, logout } = authSlice.actions;
export default authSlice.reducer; 