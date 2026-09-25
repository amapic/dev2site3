import type { Metadata } from "next";
import localFont from "next/font/local";
import { Bodoni_Moda } from "next/font/google";
import CookieConsent from "@/components/cookie-consent";
import SmoothScroll from "@/components/smoothscroll";
import ChatWidget from "@/components/chat-widget";
import "./globals.scss";

const geistSans = localFont({
  src: "../../public/font/Geist/static/Geist-Regular.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni-moda",
  display: "swap",
});

const zolinaBold = localFont({
  src: "../../public/font/Zolina/zolina-bold.ttf",
  // src: "../../public/font/classic-rock-personal-use/Classic Rock.ttf",
  variable: "--font-zolina-bold",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dev2site - conception de sites web",
  description: "Dev2site conçoit des sites web sur mesure, rapides, soignés et performants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${bodoniModa.variable} ${zolinaBold.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CookieConsent />
        <SmoothScroll />
        <ChatWidget />
      </body>
    </html>
  );
}
