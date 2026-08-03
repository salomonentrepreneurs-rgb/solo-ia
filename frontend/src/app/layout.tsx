import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Solo IA — Créez vos applications en français',
  description: 'Plateforme de création d\'applications par IA. Décrivez votre idée en français, et Solo IA construit, déploie et héberge votre application full-stack en minutes.',
  openGraph: {
    title: 'Solo IA — Créez vos applications en français',
    description: 'La plateforme de création d\'applications par IA la plus avancée.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1a25',
                color: '#f0f0f5',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}