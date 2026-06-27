import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'Elo Imob - CRM',
  description: 'Menos cliques. Mais chaves entregues',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="h-full">
      <body suppressHydrationWarning className="h-full m-0 flex flex-col overflow-hidden font-sans text-white bg-[#001F3F]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
