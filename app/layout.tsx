import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NUS MMA – Training Sessions",
  description: "Sign up for NUS MMA training sessions",
  icons: { icon: "/NUS_MMA_Logo_No BG.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
