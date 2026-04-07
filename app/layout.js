import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata = {
  title: 'Multi-Agent Universe',
  description: 'AI Agent System with Real-time Task Processing',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
