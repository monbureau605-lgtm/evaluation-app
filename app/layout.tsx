import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Évaluation bijoux septembre 2026',
  description: "Plateforme globale d'évaluation de bijoux - Édition Septembre 2026. Évaluation participative, acceptabilité prix, statistiques et gestion de campagnes.",
  openGraph: {
    title: 'Évaluation bijoux septembre 2026',
    description: "Plateforme globale d'évaluation de bijoux - Édition Septembre 2026. Évaluation participative, acceptabilité prix, statistiques et gestion de campagnes.",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Évaluation bijoux septembre 2026',
    description: "Plateforme globale d'évaluation de bijoux - Édition Septembre 2026. Évaluation participative, acceptabilité prix, statistiques et gestion de campagnes.",
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fr" className="h-full dark" suppressHydrationWarning>
      <body className="min-h-full bg-slate-950 text-slate-100 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
