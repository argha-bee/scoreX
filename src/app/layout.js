// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import SessionProviderWrapper from "@/components/wrapper/SessionProviderWrapper";
import Navbar from "@/components/Navbar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "ScoreX",
  description: "Get Live Cricket Match Scores",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProviderWrapper>
          <Navbar />
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
