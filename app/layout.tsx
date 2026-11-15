import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Gravity in a Bottle',
  description:
    'An interactive space adventure!',
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preload" as="image" href="/assets/lore_bg.png" />
        <link rel="preload" as="image" href="/assets/ending_bg.png" />
        <link rel="preload" as="image" href="/assets/team_logo.png" />
        <link rel="preload" as="image" href="/assets/crew_deck.png" />
        <link rel="preload" as="image" href="/assets/title.png" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
