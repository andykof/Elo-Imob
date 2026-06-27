'use client';

import { useAuth } from '@/components/AuthProvider';
import Dashboard from '@/components/Dashboard';
import Image from 'next/image';

export default function Home() {
  const { user, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#001F3F]">
        <div className="w-12 h-12 border-4 border-[#FF8C00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div 
        className="flex-1 flex flex-col items-center justify-center relative bg-[#001F3F] text-white overflow-hidden"
      >
        <Image 
          src="https://drive.google.com/uc?export=view&id=1GOkRo6AbeRU37SL_phYPImrVGhz3Fu0y"
          alt="Elo Imob Background"
          fill
          className="object-cover opacity-60 z-0"
          priority
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 z-10 bg-[#001F3F]/40 mix-blend-multiply" />
        
        <div className="z-20 flex flex-col items-center">
          <h1 className="text-6xl font-extrabold mb-4 drop-shadow-2xl tracking-tight">Elo Imob CRM</h1>
          <p className="text-blue-100 mb-10 text-2xl font-medium drop-shadow-lg">Menos cliques. Mais chaves entregues.</p>
          <button 
            onClick={signIn}
            className="bg-[#FF8C00] hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-4 px-12 text-lg rounded-full transition-all shadow-xl shadow-orange-900/50 active:scale-95"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
