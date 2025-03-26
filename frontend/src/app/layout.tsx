import { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/common/theme-provider";
import { nunito } from "@/lib/fonts";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Toaster } from "react-hot-toast";
import AuthInitializer from "@/components/common/auth-initializer";


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="icon" type="image/png" href="/favicon.ico" />
      </head>
      <body className={`flex min-h-screen relative ${nunito.className}`}>
          <AuthInitializer>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster position="top-right" />

            </ThemeProvider>
          </AuthInitializer>
      </body>
    </html>
  );
}
