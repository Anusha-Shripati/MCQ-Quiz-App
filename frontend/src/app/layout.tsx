import { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/common/theme-provider";
import { nunito } from "@/lib/fonts";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`flex min-h-screen relative ${nunito.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

