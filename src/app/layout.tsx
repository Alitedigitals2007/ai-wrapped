import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AI Wrapped — Discover how AI sees you",
    template: "%s · AI Wrapped",
  },
  description:
    "AI Wrapped reveals your AI personality. Get a beautiful, shareable Spotify Wrapped-style summary of how you use AI.",
  keywords: ["AI Wrapped", "AI personality", "AI wrapped", "personality test"],
  openGraph: {
    title: "AI Wrapped — Discover how AI sees you",
    description:
      "Paste your AI conversation and get a stunning, shareable summary of your AI personality.",
    type: "website",
    siteName: "AI Wrapped",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Wrapped — Discover how AI sees you",
    description:
      "Paste your AI conversation and get a stunning, shareable summary of your AI personality.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0b14",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
