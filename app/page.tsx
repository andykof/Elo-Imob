'use client';

import { useAuth } from '@/components/AuthProvider';
import Dashboard from '@/components/Dashboard';
import Image from 'next/image';
import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Home() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro de autenticação');
    }
  };

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
        
        <div className="z-20 flex flex-col items-center w-full max-w-sm px-4">
          <h1 className="text-5xl font-extrabold mb-2 drop-shadow-2xl tracking-tight text-center">Elo Imob CRM</h1>
          <p className="text-blue-100 mb-8 text-xl font-medium drop-shadow-lg text-center">Menos cliques. Mais chaves entregues.</p>
          
          <form onSubmit={handleSubmit} className="w-full bg-[#001224]/80 backdrop-blur-md p-6 rounded-2xl border border-blue-900/50 shadow-2xl flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center mb-2">{isLogin ? 'Entrar' : 'Criar Conta'}</h2>
            
            {error && <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm p-3 rounded-lg text-center">{error}</div>}
            
            <div>
              <label className="block text-[11px] font-bold text-blue-300 mb-1.5 uppercase tracking-wider">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#001F3F] border border-blue-900/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-all" 
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-blue-300 mb-1.5 uppercase tracking-wider">Senha</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#001F3F] border border-blue-900/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-all" 
              />
            </div>

            <button 
              type="submit"
              className="mt-2 w-full bg-[#FF8C00] hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-xl shadow-orange-900/50 active:scale-95"
            >
              {isLogin ? 'Entrar no CRM' : 'Criar minha conta'}
            </button>

            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="mt-2 text-sm text-blue-300 hover:text-white transition-colors text-center"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre aqui'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
