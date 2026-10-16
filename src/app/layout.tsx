import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Plearny | เปลี่ยนการเรียนรู้ให้เป็นการผจญภัย",
  description: "Plearny คือเกมผจญภัยเพื่อการศึกษาระดับพรีเมียมสำหรับนักเรียนประถม",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="h-full flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">
        {children}
      </body>
    </html>
  );
}
