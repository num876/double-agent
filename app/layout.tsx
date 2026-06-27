import type { Metadata } from "next";
import { IM_Fell_English, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const imFellEnglish = IM_Fell_English({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-im-fell-english",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Double Agent",
  description: "A Cold War espionage narrative simulation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${imFellEnglish.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background text-primary font-sans antialiased min-h-screen">
        <div className="scanlines"></div>
        <div className="paper-texture"></div>
        {children}
      </body>
    </html>
  );
}
