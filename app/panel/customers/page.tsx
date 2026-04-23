'use client';

import { useState, useEffect } from 'react';

interface Branch {
  id: string;
  name: string;
  address: string;
  is_default: boolean;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  title: string | null;
  is_default: boolean;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  type: 'individual' | 'company';
  notes: string | null;
  branches: Branch[];
  contacts: Contact[];
}

const API_URL = 'http://localhost:8000/api';

async function getCustomers(token: string): Promise<Customer[]> {
  const response = await fetch(`${API_URL}/customers`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Musteriler alinamadi');
  return response.json();
}

async function createCustomer(token: string, data: {
  name: string;
  phone: string;
  type: string;
  notes?: string;
  branches?: { name: string; address: string; is_default?: boolean }[];
  contacts?: { name: string; phone: string; title?: string; is_default?: boolean }[];
}): Promise<Customer> {
  const response = await fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Musteri olusturulamadi');
  }
  return response.json();
}

async function deleteCustomer(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_URL}/customers/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Musteri silinemedi');
}

async function addBranch(token: string, customerId: string, data: { name: string; address: string; is_default?: boolean }): Promise<Branch> {
  const response = await fetch(`${API_URL}/customers/${customerId}/branches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Sube eklenemedi');
  return response.json();
}

async function deleteBranch(token: string, customerId: string, branchId: string): Promise<void> {
  const response = await fetch(`${API_URL}/customers/${customerId}/branches/${branchId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Sube silinemedi');
}

async function addContact(token: string, customerId: string, data: { name: string; phone: string; title?: string; is_default?: boolean }): Promise<Contact> {
  const response = await fetch(`${API_URL}/customers/${customerId}/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Iletisim kisisi eklenemedi');
  return response.json();
}

async function deleteContact(token: string, customerId: string, contactId: string): Promise<void> {
  const response = await fetch(`${API_URL}/customers/${customerId}/contacts/${contactId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Iletisim kisisi silinemedi');
}

async function setDefaultContact(token: string, customerId: string, contactId: string): Promise<void> {
  const response = await fetch(`${API_URL}/customers/${customerId}/contacts/${contactId}/default`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Varsayilan yapilamadi');
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<'individual' | 'company'>('individual');
  const [notes, setNotes] = useState('');
  const [branches, setBranches] = useState<{ name: string; address: string; is_default: boolean }[]>([]);
  const [contacts, setContacts] = useState<{ name: string; phone: string; title: string; is_default: boolean }[]>([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Branch/Contact add states
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactTitle, setNewContactTitle] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const data = await getCustomers(token);
      setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setType('individual');
    setNotes('');
    setBranches([]);
    setContacts([]);
    setShowModal(false);
    setError('');
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
      await createCustomer(token, {
        name,
        phone,
        type,
        notes: notes || undefined,
        branches: branches.length > 0 ? branches : undefined,
        contacts: contacts.length > 0 ? contacts : undefined,
      });
      setSuccess('Musteri olusturuldu');
      resetForm();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Islem basarisiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`${customer.name} musterisini silmek istediginize emin misiniz?`)) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await deleteCustomer(token, customer.id);
      setCustomers(customers.filter((c) => c.id !== customer.id));
      setSuccess('Musteri silindi');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Musteri silinemedi');
    }
  };

  const openDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleAddBranchToCustomer = async () => {
    if (!selectedCustomer) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await addBranch(token, selectedCustomer.id, {
        name: newBranchName,
        address: newBranchAddress,
      });
      loadData();
      setNewBranchName('');
      setNewBranchAddress('');
      setShowAddBranch(false);
      // Refresh selected customer
      const updated = await getCustomers(token);
      setCustomers(updated);
      setSelectedCustomer(updated.find(c => c.id === selectedCustomer.id) || null);
    } catch (e) {
      alert('Sube eklenemedi');
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!selectedCustomer) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await deleteBranch(token, selectedCustomer.id, branchId);
      const updated = await getCustomers(token);
      setCustomers(updated);
      setSelectedCustomer(updated.find(c => c.id === selectedCustomer.id) || null);
    } catch (e) {
      alert('Sube silinemedi');
    }
  };

  const handleAddContactToCustomer = async () => {
    if (!selectedCustomer) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await addContact(token, selectedCustomer.id, {
        name: newContactName,
        phone: newContactPhone,
        title: newContactTitle || undefined,
      });
      setNewContactName('');
      setNewContactPhone('');
      setNewContactTitle('');
      setShowAddContact(false);
      const updated = await getCustomers(token);
      setCustomers(updated);
      setSelectedCustomer(updated.find(c => c.id === selectedCustomer.id) || null);
    } catch (e) {
      alert('Iletisim kisisi eklenemedi');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!selectedCustomer) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await deleteContact(token, selectedCustomer.id, contactId);
      const updated = await getCustomers(token);
      setCustomers(updated);
      setSelectedCustomer(updated.find(c => c.id === selectedCustomer.id) || null);
    } catch (e) {
      alert('Iletisim kisisi silinemedi');
    }
  };

  const handleSetDefaultContact = async (contactId: string) => {
    if (!selectedCustomer) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await setDefaultContact(token, selectedCustomer.id, contactId);
      const updated = await getCustomers(token);
      setCustomers(updated);
      setSelectedCustomer(updated.find(c => c.id === selectedCustomer.id) || null);
    } catch (e) {
      alert('Varsayilan yapilamadi');
    }
  };

  const addBranchToForm = () => {
    setBranches([...branches, { name: '', address: '', is_default: branches.length === 0 }]);
  };

  const addContactToForm = () => {
    setContacts([...contacts, { name: '', phone: '', title: '', is_default: contacts.length === 0 }]);
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
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-800">Musteriler</h2>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-zinc-800 text-white text-sm rounded-md hover:bg-zinc-700 transition-colors min-h-[44px]"
          >
            Yeni Musteri Olustur
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
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Ad Soyad / Firma</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Telefon</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Tip</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Sube</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Iletisim</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-600">Islemler</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-zinc-50">
                  <td className="py-3 px-4 text-sm text-zinc-800">{customer.name}</td>
                  <td className="py-3 px-4 text-sm text-zinc-600">{customer.phone}</td>
                  <td className="py-3 px-4 text-sm text-zinc-600">
                    {customer.type === 'individual' ? 'Bireysel' : 'Kurumsal'}
                  </td>
                  <td className="py-3 px-4 text-sm text-zinc-600">{customer.branches.length} sube</td>
                  <td className="py-3 px-4 text-sm text-zinc-600">{customer.contacts.length} kisi</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openDetail(customer)}
                      className="text-sm text-zinc-600 hover:text-zinc-800 mr-4"
                    >
                      Detay
                    </button>
                    <button
                      onClick={() => handleDelete(customer)}
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
          {customers.map((customer) => (
            <div key={customer.id} className="border rounded-lg p-4 bg-zinc-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-zinc-800 text-sm">{customer.name}</h3>
                  <p className="text-sm text-zinc-600">{customer.phone}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {customer.type === 'individual' ? 'Bireysel' : 'Kurumsal'} • 
                    {customer.branches.length} sube • {customer.contacts.length} kisi
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openDetail(customer)}
                  className="flex-1 py-2 px-3 bg-zinc-100 text-zinc-700 text-sm rounded hover:bg-zinc-200 min-h-[40px]"
                >
                  Detay
                </button>
                <button
                  onClick={() => handleDelete(customer)}
                  className="flex-1 py-2 px-3 bg-red-50 text-red-600 text-sm rounded hover:bg-red-100 min-h-[40px]"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 text-black p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-lg shadow-lg w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white">
              <h3 className="text-base sm:text-lg font-semibold text-zinc-800">Yeni Musteri Olustur</h3>
              <button onClick={resetForm} className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-600 min-h-[44px] sm:min-h-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Ad Soyad / Firma *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 text-base min-h-[44px]"
                    placeholder="Orn: Ahmet Yilmaz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Telefon *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 text-base min-h-[44px]"
                    placeholder="05xx..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Tip</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'individual' | 'company')}
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 text-base min-h-[44px]"
                >
                  <option value="individual">Bireysel</option>
                  <option value="company">Kurumsal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Not</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 text-base min-h-[80px]"
                  rows={3}
                />
              </div>

              {/* Branches */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-zinc-700">Subeler</label>
                  <button
                    type="button"
                    onClick={addBranchToForm}
                    className="text-sm text-zinc-600 hover:text-zinc-800"
                  >
                    + Sube Ekle
                  </button>
                </div>
                {branches.map((branch, idx) => (
                  <div key={idx} className="border rounded-md p-3 mb-2">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Sube {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setBranches(branches.filter((_, i) => i !== idx))}
                        className="text-sm text-red-600"
                      >
                        Sil
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Sube Adi"
                        value={branch.name}
                        onChange={(e) => {
                          const updated = [...branches];
                          updated[idx].name = e.target.value;
                          setBranches(updated);
                        }}
                        className="px-3 py-3 sm:py-2 border border-zinc-300 rounded-md text-sm min-h-[44px]"
                      />
                      <input
                        type="text"
                        placeholder="Adres"
                        value={branch.address}
                        onChange={(e) => {
                          const updated = [...branches];
                          updated[idx].address = e.target.value;
                          setBranches(updated);
                        }}
                        className="px-3 py-3 sm:py-2 border border-zinc-300 rounded-md text-sm min-h-[44px]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Contacts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-zinc-700">Iletisim Kisileri</label>
                  <button
                    type="button"
                    onClick={addContactToForm}
                    className="text-sm text-zinc-600 hover:text-zinc-800"
                  >
                    + Kisi Ekle
                  </button>
                </div>
                {contacts.map((contact, idx) => (
                  <div key={idx} className="border rounded-md p-3 mb-2">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Kisi {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setContacts(contacts.filter((_, i) => i !== idx))}
                        className="text-sm text-red-600"
                      >
                        Sil
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Ad Soyad"
                        value={contact.name}
                        onChange={(e) => {
                          const updated = [...contacts];
                          updated[idx].name = e.target.value;
                          setContacts(updated);
                        }}
                        className="px-3 py-3 sm:py-2 border border-zinc-300 rounded-md text-sm min-h-[44px]"
                      />
                      <input
                        type="text"
                        placeholder="Telefon"
                        value={contact.phone}
                        onChange={(e) => {
                          const updated = [...contacts];
                          updated[idx].phone = e.target.value;
                          setContacts(updated);
                        }}
                        className="px-3 py-3 sm:py-2 border border-zinc-300 rounded-md text-sm min-h-[44px]"
                      />
                      <input
                        type="text"
                        placeholder="Unvan (Yetkili vs)"
                        value={contact.title}
                        onChange={(e) => {
                          const updated = [...contacts];
                          updated[idx].title = e.target.value;
                          setContacts(updated);
                        }}
                        className="px-3 py-3 sm:py-2 border border-zinc-300 rounded-md text-sm min-h-[44px]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t sticky bottom-0 bg-white">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:flex-1 py-3 sm:py-2 px-4 bg-zinc-800 text-white font-medium rounded-md hover:bg-zinc-700 disabled:opacity-50 transition-colors min-h-[44px]"
                >
                  {submitting ? 'Kaydediliyor...' : 'Olustur'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-3 sm:py-2 border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50 min-h-[44px]"
                >
                  Vazgec
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-lg shadow-lg w-full sm:max-w-3xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white">
              <h3 className="text-base sm:text-lg font-semibold text-zinc-800 truncate pr-4">{selectedCustomer.name}</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedCustomer(null);
                  setShowAddBranch(false);
                  setShowAddContact(false);
                }}
                className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-600 min-h-[44px] sm:min-h-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-zinc-500">Telefon:</span>
                  <p className="font-medium break-all">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Tip:</span>
                  <p className="font-medium">{selectedCustomer.type === 'individual' ? 'Bireysel' : 'Kurumsal'}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Not:</span>
                  <p className="font-medium break-words">{selectedCustomer.notes || '-'}</p>
                </div>
              </div>

              {/* Branches Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-zinc-800">Subeler</h4>
                  <button
                    onClick={() => setShowAddBranch(!showAddBranch)}
                    className="text-sm text-zinc-600 hover:text-zinc-800"
                  >
                    + Sube Ekle
                  </button>
                </div>

                {showAddBranch && (
                  <div className="border rounded-md p-3 mb-3 bg-zinc-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Sube Adi"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        className="px-3 py-3 sm:py-2 border border-zinc-300 rounded-md text-sm min-h-[44px]"
                      />
                      <input
                        type="text"
                        placeholder="Adres"
                        value={newBranchAddress}
                        onChange={(e) => setNewBranchAddress(e.target.value)}
                        className="px-3 py-3 sm:py-2 border border-zinc-300 rounded-md text-sm min-h-[44px]"
                      />
                    </div>
                    <button
                      onClick={handleAddBranchToCustomer}
                      className="w-full sm:w-auto px-4 py-3 sm:py-1 bg-zinc-800 text-white text-sm rounded-md min-h-[44px] sm:min-h-0"
                    >
                      Ekle
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {selectedCustomer.branches.map((branch) => (
                    <div key={branch.id} className="flex items-center justify-between border rounded-md p-3">
                      <div>
                        <p className="font-medium text-sm">{branch.name}</p>
                        <p className="text-sm text-zinc-500">{branch.address}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteBranch(branch.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Sil
                      </button>
                    </div>
                  ))}
                  {selectedCustomer.branches.length === 0 && (
                    <p className="text-sm text-zinc-500">Henuz sube eklenmemis</p>
                  )}
                </div>
              </div>

              {/* Contacts Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-zinc-800">Iletisim Kisileri</h4>
                  <button
                    onClick={() => setShowAddContact(!showAddContact)}
                    className="text-sm text-zinc-600 hover:text-zinc-800"
                  >
                    + Kisi Ekle
                  </button>
                </div>

                {showAddContact && (
                  <div className="border rounded-md p-3 mb-3 bg-zinc-50">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Ad Soyad"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        className="px-3 py-3 sm:py-2 border border-zinc-300 rounded-md text-sm min-h-[44px]"
                      />
                      <input
                        type="text"
                        placeholder="Telefon"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        className="px-3 py-3 sm:py-2 border border-zinc-300 rounded-md text-sm min-h-[44px]"
                      />
                      <input
                        type="text"
                        placeholder="Unvan"
                        value={newContactTitle}
                        onChange={(e) => setNewContactTitle(e.target.value)}
                        className="px-3 py-3 sm:py-2 border border-zinc-300 rounded-md text-sm min-h-[44px]"
                      />
                    </div>
                    <button
                      onClick={handleAddContactToCustomer}
                      className="w-full sm:w-auto px-4 py-3 sm:py-1 bg-zinc-800 text-white text-sm rounded-md min-h-[44px] sm:min-h-0"
                    >
                      Ekle
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {selectedCustomer.contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between border rounded-md p-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-sm">
                            {contact.name}
                            {contact.is_default && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Varsayilan</span>
                            )}
                          </p>
                          <p className="text-sm text-zinc-500">{contact.phone}</p>
                          {contact.title && <p className="text-xs text-zinc-400">{contact.title}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!contact.is_default && (
                          <button
                            onClick={() => handleSetDefaultContact(contact.id)}
                            className="text-xs text-zinc-600 hover:text-zinc-800"
                          >
                            Varsayilan Yap
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedCustomer.contacts.length === 0 && (
                    <p className="text-sm text-zinc-500">Henuz iletisim kisisi eklenmemis</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
