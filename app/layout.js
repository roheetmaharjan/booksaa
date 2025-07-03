import { Archivo } from "next/font/google";
import "../styles/globals.css";

const archivo = Archivo({
  weight: ["400", "700"],
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata = {
  title: "Bookaroo",
  description: "Go to service Provider",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
