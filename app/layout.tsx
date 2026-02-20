import type { Metadata } from "next";
import "./globals.css";
import "../styles/spotifyTheme.css";
import { AuthProvider } from "@/components/AuthProvider/AuthProvider";
import Footer from "@/components/Footer/Footer";

export const metadata: Metadata = {
  title: "Plataforma de contratação de artistas",
  description: "Plataforma de contratação de artistas para eventos privados.",
  applicationName: "Plataforma de contratação de artistas",
  keywords: [
    "contratação de artistas",
    "eventos privados",
    "booking de artistas",
    "música ao vivo",
    "shows",
  ],
  authors: [{ name: "Plataforma de contratação de artistas" }],
  openGraph: {
    title: "Plataforma de contratação de artistas",
    description: "Plataforma de contratação de artistas para eventos privados.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plataforma de contratação de artistas",
    description: "Plataforma de contratação de artistas para eventos privados.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <AuthProvider>
          <div className="appShell">
            <main className="appMain">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
