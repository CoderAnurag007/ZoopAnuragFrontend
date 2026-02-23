import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import Navbar from "./components/Navbar";
import NavbarWrapper from "./components/NavbarWrapper";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ZoopXAnurag",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavbarWrapper>{children}</NavbarWrapper>
      </body>
    </html>
  );
}
