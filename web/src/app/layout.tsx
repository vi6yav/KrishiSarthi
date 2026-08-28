import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./LanguageContext";
import LanguageToggle from "./LanguageToggle";

export const metadata: Metadata = {
  title: "KrishiSarthi",
  description:
    "AI-driven decision-support platform for Indian farmers — pest prediction, input optimization, mandi price intelligence, and cold storage management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <LanguageProvider>
          {children}
          <LanguageToggle />
        </LanguageProvider>
      </body>
    </html>
  );
}