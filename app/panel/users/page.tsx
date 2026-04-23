'use client';

import { useState, useEffect } from 'react';
import { register, getRoles } from '@/lib/api';

interface Role {
  id: string;
  name: string;
  display_name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: Role | null;
}

const API_URL = 'http://localhost:8000/api';

async function getUsers(token: string): Promise<User[]> {
  const response = await fetch(`${API_URL}/users`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Kullanicilar alinamadi');
  return response.json();
}

async function deleteUser(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Kullanici silinemedi');
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [roleId, setRoleId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const [usersData, rolesData] = await Promise.all([
        getUsers(token),
        getRoles(token),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPasswordConfirmation('');
    setRoleId('');
    setShowModal(false);
    setError('');
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`${user.name} kullanicisini silmek istediginize emin misiniz?`)) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await deleteUser(token, user.id);
      setUsers(users.filter((u) => u.id !== user.id));
      setSuccess('Kullanici silindi');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Kullanici silinemedi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Oturum bulunamadi');
      setSubmitting(false);
      return;
    }

    try {
      await register(token, name, email, password, passwordConfirmation, roleId);
      setSuccess('Kullanici olusturuldu');
      resetForm();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayit basarisiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-zinc-600">Yukleniyor...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 text-black">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-800">Kullanicilar</h2>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-zinc-800 text-white text-sm rounded-md hover:bg-zinc-700 transition-colors min-h-[44px]"
          >
            Kullanici Ekle
          </button>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Ad Soyad</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">E-posta</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Rol</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-600">Islemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-zinc-50">
                  <td className="py-3 px-4 text-sm text-zinc-800">{user.name}</td>
                  <td className="py-3 px-4 text-sm text-zinc-600">{user.email}</td>
                  <td className="py-3 px-4 text-sm text-zinc-600">
                    {user.role?.display_name || '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(user)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {users.map((user) => (
            <div key={user.id} className="border rounded-lg p-4 bg-zinc-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-zinc-800 text-sm">{user.name}</h3>
                  <p className="text-sm text-zinc-600 break-all">{user.email}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Rol: {user.role?.display_name || '-'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleDelete(user)}
                  className="py-2 px-4 bg-red-50 text-red-600 text-sm rounded hover:bg-red-100 min-h-[40px]"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 text-black p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-lg shadow-lg w-full sm:max-w-md h-full sm:h-auto overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white">
              <h3 className="text-base sm:text-lg font-semibold text-zinc-800">Yeni Kullanici</h3>
              <button
                onClick={resetForm}
                className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-600 min-h-[44px] sm:min-h-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent text-base min-h-[44px]"
                  placeholder="Ad Soyad"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
                  E-posta
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent text-base min-h-[44px]"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-zinc-700 mb-1">
                  Rol
                </label>
                <select
                  id="role"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent text-base min-h-[44px]"
                >
                  <option value="">Rol Secin</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1">
                  Sifre
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent text-base min-h-[44px]"
                  placeholder="En az 6 karakter"
                />
              </div>

              <div>
                <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-zinc-700 mb-1">
                  Sifre Tekrar
                </label>
                <input
                  type="password"
                  id="passwordConfirmation"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent text-base min-h-[44px]"
                  placeholder="Sifreyi tekrar girin"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t sticky bottom-0 bg-white">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:flex-1 py-3 sm:py-2 px-4 bg-zinc-800 text-white font-medium rounded-md hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                >
                  {submitting ? 'Kaydediliyor...' : 'Kullanici Olustur'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-3 sm:py-2 border border-zinc-300 text-zinc-700 font-medium rounded-md hover:bg-zinc-50 transition-colors min-h-[44px]"
                >
                  Iptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
