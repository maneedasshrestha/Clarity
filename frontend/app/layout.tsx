import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/Theme/ThemeProvider";
import ClickSparkThemeWrapper from "@/components/ClickSpark/ClickSparkWrapper";

export const metadata: Metadata = {
  title: "Clarity",
  description: "Simple Expense Tracking Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ClickSparkThemeWrapper>{children}</ClickSparkThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
