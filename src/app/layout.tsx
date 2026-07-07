import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VELOUR | International Fashion",
  description: "Explore curated collections and everyday essentials thoughtfully designed.",
};

import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import PublicLayoutWrapper from "@/components/PublicLayoutWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased light`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans selection:bg-[#ff5c00] selection:text-white overflow-x-hidden">
        <AuthProvider>
          <SmoothScrollProvider>
            <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
          </SmoothScrollProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
