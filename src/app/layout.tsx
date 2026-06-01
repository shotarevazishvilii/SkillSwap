import type { Metadata, Viewport } from "next";

import { SkipLink } from "@/components/shared/skip-link";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { createRootMetadata } from "@/lib/constants/metadata";

import "./globals.css";

export const metadata: Metadata = createRootMetadata();

export const viewport: Viewport = {
  colorScheme: "light dark",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1020" },
  ],
  width: "device-width",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body>
        <ThemeProvider
          disableTransitionOnChange
          enableSystem
          attribute="class"
          defaultTheme="system"
        >
          <SkipLink />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
