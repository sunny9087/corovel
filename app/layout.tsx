import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import AnimatedNetwork from "@/components/AnimatedNetwork";

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
  title: "Corovel - Your Personal Operating System",
  description: "Turn daily actions into long-term clarity. A system for people who are building something.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative overflow-x-hidden`}
      >
        {/* Global animated background (subtle, non-interactive) */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 opacity-15">
          <AnimatedNetwork />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
