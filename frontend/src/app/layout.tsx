'use client';
import { ReactNode, useEffect } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/common/theme-provider";
import { nunito } from "@/lib/fonts";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useAppDispatch } from "@/store/hooks";
import { initializeAuth } from "@/store/features/authSlice";

function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="icon" type="image/png" href="/favicon.ico" />
      </head>
      <body className={`flex min-h-screen relative ${nunito.className}`}>
        <Provider store={store}>
          <AuthInitializer>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>{children}</TooltipProvider>
            </ThemeProvider>
          </AuthInitializer>
        </Provider>
      </body>
    </html>
  );
}
