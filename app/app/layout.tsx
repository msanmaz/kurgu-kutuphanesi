import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kurgu Kütüphanesi",
  description: "devmert7 vault'undaki kurgu ve hareket stilleri",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
