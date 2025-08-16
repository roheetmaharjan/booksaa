import { Archivo } from "next/font/google";
import "../styles/globals.css";
import SessionWrapper from "@/components/components_admin/SessionWrapper";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/components_marketing/Header";
import Footer from "@/components/components_marketing/Footer";

const archivo = Archivo({
  weight: ["400", "700"],
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata = {
  title: "Booksaa",
  description: "Go to service Provider",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} antialiased`}>
        <SessionWrapper>
          {children}
          <Toaster position="top-center" theme="light" richColors /> 
        </SessionWrapper>
      </body>
    </html>
  );
}
