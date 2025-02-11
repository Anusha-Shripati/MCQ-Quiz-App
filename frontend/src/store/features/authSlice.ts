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

      const data: { data: User; message?: string } = await response.json();
      
      if (response.ok && data.data.token) {
        // Store entire data.data object
        localStorage.setItem("user", JSON.stringify(data.data));
        
        document.cookie = `token=${data.data.token}; path=/;`;
        
        return data.data;
      }
      
      return rejectWithValue(data.message || "Login failed");
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuth: (state) => {
      const storedUser = localStorage.getItem("user");
      
      if (storedUser) {
        try {
          state.user = JSON.parse(storedUser);
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem("user"); // Remove invalid data
          state.user = null;
        }
      }
      state.initializing = false;
    },
    logout: (state) => {
      localStorage.removeItem("user"); // Remove entire user object
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
