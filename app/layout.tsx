import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SessionProviderWrapper from './components/SessionProviderWrapper';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Agentic AI Platform',
  description: 'Build, manage, and deploy intelligent AI agents',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = process.env.NEXT_PUBLIC_THEME || "1";
  return (
    <html lang="en" className={`${inter.variable}`} data-theme={theme}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = "${process.env.NEXT_PUBLIC_THEME || "1"}";
                document.documentElement.setAttribute("data-theme", theme);
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
