import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>

        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.0/styles/monokai-sublime.min.css"></link>

        {/* <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.0/styles/atom-one-dark.min.css" ></link> */}

        {/* <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.0/styles/default.min.css"></link> */}
        {/* <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlightjs-themes@1.0.0/atelier-cave.dark.css"></link> */}
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
