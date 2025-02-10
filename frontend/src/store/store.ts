import { configureStore } from "@reduxjs/toolkit";
import assessmentReducer from "./features/assessmentSlice";
import candidatesReducer from "./features/candidatesSlice"
import authReducer from './features/authSlice';

export const store = configureStore({
  reducer: {
    assessment: assessmentReducer,
    candidates: candidatesReducer,
    auth: authReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;