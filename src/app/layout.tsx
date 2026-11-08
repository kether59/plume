import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppLocaleProvider } from "@/components/AppLocaleProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plume & Premier Jet — L'Atelier d'Écriture Bienveillant",
  description: "Outil d'aide à l'écriture de romans assisté par IA, pensé pour accompagner les écrivains débutants tout au long du processus créatif.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <AppLocaleProvider>{children}</AppLocaleProvider>
      </body>
    </html>
  );
}
