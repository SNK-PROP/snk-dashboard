import { Geist, Geist_Mono } from "next/font/google";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Med-1 Web",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ProtectedRoute>
        {children}
        <Toaster/>
        </ProtectedRoute>
      </body>
    </html>
  );
}
