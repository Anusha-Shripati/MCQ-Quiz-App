"use client"; // Mark this as a Client Component

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { Toaster } from "react-hot-toast";

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster position="top-right" />
    </Provider>
  );
}