import { Inter } from "next/font/google";
import Head from "next/head";
import type React from "react";
import "./globals.css";
import UmamiProvider from "next-umami";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>
      <body className={inter.className}>
        <UmamiProvider websiteId="0f3bd495-a9e0-477d-ab15-9a599af74fd3">
          {children}
        </UmamiProvider>
      </body>
    </html>
  );
}
