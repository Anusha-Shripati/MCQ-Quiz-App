import { configureStore } from "@reduxjs/toolkit";
import assessmentReducer from "./assessmentSlice";

export const store = configureStore({
  reducer: {
    assessment: assessmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;