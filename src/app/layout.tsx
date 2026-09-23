import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { DemoProvider } from "@/context/DemoContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Karsa — Pendamping Belajar & Portfolio AI Siswa Indonesia",
  description:
    "Aplikasi pendamping edtech AI dengan 5 persona Sobat Karsa untuk membedah strategi kompetisi, ritme belajar, dan portofolio siswa.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakartaSans.variable} suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased bg-karsa-bg text-slate-100 selection:bg-karsa-gold selection:text-slate-950">
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
