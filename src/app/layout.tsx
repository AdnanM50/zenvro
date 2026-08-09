import type { Metadata } from "next";
import { Inter, Manrope, Geist } from "next/font/google";
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
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import PublicLayoutWrapper from "@/components/PublicLayoutWrapper";
import QueryProvider from "@/components/QueryProvider";
import CustomToaster from "@/components/common/CustomToaster";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, manrope.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
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
      <body className="min-h-full flex flex-col font-sans selection:bg-[#ff5c00] selection:text-white overflow-x-hidden bg-background text-foreground transition-colors duration-200">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <CartProvider>
                <SmoothScrollProvider>
                  <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
                </SmoothScrollProvider>
              </CartProvider>
            </AuthProvider>
            <CustomToaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
