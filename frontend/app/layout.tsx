import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Shiv Furniture Works ERP',
  description: 'Enterprise Resource Planning for Furniture Manufacturing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-surface-DEFAULT text-text-primary" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: '!bg-surface-card !text-text-primary !border !border-surface-border',
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#0f0f1a',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f43f5e',
                  secondary: '#0f0f1a',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
