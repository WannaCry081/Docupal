import type { Metadata } from "next";
import { Google_Sans, Roboto_Serif, Roboto_Mono } from "next/font/google";

import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

import "./globals.css";

const fontSans = Google_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Roboto_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "DocuPal",
  description:
    "A small utility for grabbing tutorial PDFs from TutorialsPoint — with availability checks and a downloadable queue.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LenisProvider>
            <TooltipProvider>
              {children}
              <Toaster position="top-center" />
            </TooltipProvider>
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
