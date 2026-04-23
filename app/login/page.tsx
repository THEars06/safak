'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import Image from 'next/image';
import { Mail, Lock, LogIn, Snowflake } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/panel');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giris basarisiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="/login-bg.jpg"
          alt="Klima"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
        <div className="absolute inset-0 flex flex-col justify-center px-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Snowflake className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Teknik Servis</h1>
          </div>
          <p className="text-xl text-white/80 max-w-md">
            Profesyonel klima montaj ve servis hizmetleri yonetim sistemi
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-white/70">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-sm">✓</span>
              </div>
              <span>Musteri ve servis kayit yonetimi</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-sm">✓</span>
              </div>
              <span>Teknisyen atama ve randevu takibi</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-sm">✓</span>
              </div>
              <span>Detayli cihaz ve montaj bilgileri</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-zinc-50 px-12 py-8">
        <div className="w-full max-w-xl">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
              <Snowflake className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-800">Teknik Servis</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-12 border border-zinc-100">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-zinc-800">Hos Geldiniz</h2>
              <p className="text-zinc-500 mt-3 text-lg">Panele erisim icin giris yapin</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                <span className="text-red-500">!</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-base font-medium text-zinc-700 mb-2">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail className="w-6 h-6 text-zinc-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-14 pr-5 py-5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition-all text-zinc-800 placeholder:text-zinc-400 text-lg"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-base font-medium text-zinc-700 mb-2">
                  Sifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="w-6 h-6 text-zinc-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-14 pr-5 py-5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition-all text-zinc-800 placeholder:text-zinc-400 text-lg"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 px-4 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-lg mt-4"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Giris yapiliyor...
                  </>
                ) : (
                  <>
                    <LogIn className="w-6 h-6" />
                    Giris Yap
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
