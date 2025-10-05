import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'marketplace.lk - Buy & Sell Anything in Sri Lanka',
  description: 'Sri Lanka\'s free classifieds platform. Buy and sell vehicles, property, land, electronics, and more. Post your free ad today.',
  keywords: 'buy sell Sri Lanka, classifieds, vehicles, property, land, electronics, marketplace.lk',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '12px', fontSize: '14px' },
              success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
