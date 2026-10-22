import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthReturnRedirect } from "@/modules/autenticacion/AuthReturnRedirect";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Luck",
  description: "Plataforma freelancer por suscripción",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthReturnRedirect />
        {children}
      </body>
    </html>
  );
}
