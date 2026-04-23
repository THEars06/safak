'use client';

import { useState, useEffect } from 'react';
import { getRoles, getPermissions, createRole, updateRole, deleteRole } from '@/lib/api';

interface Permission {
  id: string;
  name: string;
  display_name: string;
  group: string;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  permissions: Permission[];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
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
      const [rolesData, permsData] = await Promise.all([
        getRoles(token),
        getPermissions(token),
      ]);
      setRoles(rolesData);
      setPermissions(permsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDisplayName('');
    setSelectedPermissions([]);
    setEditingRole(null);
    setShowModal(false);
    setError('');
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setName(role.name);
    setDisplayName(role.display_name);
    setSelectedPermissions(role.permissions.map((p) => p.id));
    setShowModal(true);
  };

  const handleDelete = async (role: Role) => {
    if (!confirm(`${role.display_name} rolunu silmek istediginize emin misiniz?`)) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await deleteRole(token, role.id);
      setRoles(roles.filter((r) => r.id !== role.id));
      setSuccess('Rol silindi');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Rol silinemedi');
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
      if (editingRole) {
        await updateRole(token, editingRole.id, name, displayName, selectedPermissions);
        setSuccess('Rol guncellendi');
      } else {
        await createRole(token, name, displayName, selectedPermissions);
        setSuccess('Rol olusturuldu');
      }
      resetForm();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Islem basarisiz');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePermission = (permId: string) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    const group = perm.group || 'Diger';
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-zinc-600">Yukleniyor...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-800">Roller</h2>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-zinc-800 text-white text-sm rounded-md hover:bg-zinc-700 transition-colors min-h-[44px]"
          >
            Yeni Rol Ekle
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
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Ad</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Gorunen Ad</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Yetkiler</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-600">Islemler</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b hover:bg-zinc-50">
                  <td className="py-3 px-4 text-sm text-zinc-800">{role.name}</td>
                  <td className="py-3 px-4 text-sm text-zinc-800">{role.display_name}</td>
                  <td className="py-3 px-4 text-sm text-zinc-600">
                    {role.permissions.length} yetki
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleEdit(role)}
                      className="text-sm text-zinc-600 hover:text-zinc-800 mr-4"
                    >
                      Duzenle
                    </button>
                    <button
                      onClick={() => handleDelete(role)}
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
          {roles.map((role) => (
            <div key={role.id} className="border rounded-lg p-4 bg-zinc-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-zinc-800 text-sm">{role.display_name}</h3>
                  <p className="text-sm text-zinc-600">{role.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {role.permissions.length} yetki
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(role)}
                  className="flex-1 py-2 px-3 bg-zinc-100 text-zinc-700 text-sm rounded hover:bg-zinc-200 min-h-[40px]"
                >
                  Duzenle
                </button>
                <button
                  onClick={() => handleDelete(role)}
                  className="flex-1 py-2 px-3 bg-red-50 text-red-600 text-sm rounded hover:bg-red-100 min-h-[40px]"
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
          <div className="bg-white rounded-none sm:rounded-lg shadow-lg w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white">
              <h3 className="text-base sm:text-lg font-semibold text-zinc-800">
                {editingRole ? 'Rol Duzenle' : 'Yeni Rol'}
              </h3>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">
                    Rol Adi (sistem)
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent text-base min-h-[44px]"
                    placeholder="ornek: editor"
                  />
                </div>
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-zinc-700 mb-1">
                    Gorunen Ad
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent text-base min-h-[44px]"
                    placeholder="ornek: Editor"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-3">Yetkiler</label>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {Object.entries(groupedPermissions).map(([group, perms]) => (
                    <div key={group} className="border rounded-md p-3 sm:p-4">
                      <h4 className="text-sm font-medium text-zinc-800 mb-2">{group}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map((perm) => (
                          <label key={perm.id} className="flex items-start gap-2 text-sm text-zinc-600 py-1">
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              className="rounded border-zinc-300 mt-0.5 flex-shrink-0"
                            />
                            <span className="break-words">{perm.display_name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t sticky bottom-0 bg-white">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-zinc-800 text-white font-medium rounded-md hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                >
                  {submitting ? 'Kaydediliyor...' : editingRole ? 'Guncelle' : 'Olustur'}
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
