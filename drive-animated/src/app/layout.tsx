import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "The Drive - SOPHIE Archive",
  description: "A comprehensive archive preserving the artistry, legacy, and creative vision of SOPHIE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
