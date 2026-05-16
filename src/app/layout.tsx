import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import AccessibilityInitializer from "@/components/AccessibilityInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NavegaGov | Literacia Digital para Serviços Públicos",
  description: "Plataforma para ajudar cidadãos portugueses e imigrantes a navegar nos portais da administração pública (Segurança Social, Finanças, ePortugal).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AccessibilityInitializer />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Chatbot />
      </body>
    </html>
  );
}
