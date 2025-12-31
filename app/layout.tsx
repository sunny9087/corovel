import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Corovel - Build Habits Through Daily Actions",
  description: "Build habits through simple daily actions. Earn points and track your progress.",
  icons: {
    icon: [
      { url: "/corovel-logo.png", type: "image/png" },
      { url: "/corovel-logo.png", sizes: "32x32", type: "image/png" },
      { url: "/corovel-logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/corovel-logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/corovel-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
