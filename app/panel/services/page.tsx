'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Branch {
  id: string;
  name: string;
  address: string;
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
  branches: Branch[];
  contacts: Contact[];
}

interface Device {
  id?: string;
  brand: string;
  brand_other?: string;
  device_type: string;
  btu: string;
  indoor_model: string;
  outdoor_model: string;
  quantity: number;
  floor: number;
  has_elevator: boolean;
  has_parking: boolean;
  needs_forklift: boolean;
  needs_scaffold: boolean;
  outdoor_unit_location: string;
  electrical_ready: boolean;
  needs_drilling: boolean;
  drilling_notes: string;
  notes: string;
}

interface Technician {
  id: string;
  name: string;
  email: string;
}

interface Service {
  id: string;
  customer: Customer;
  branch: Branch | null;
  contact: Contact | null;
  type: string;
  status: string;
  has_inspection: boolean;
  inspection_notes: string | null;
  inspection_date: string | null;
  representative_notes: string | null;
  technician: Technician | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  completed_date: string | null;
  completion_notes: string | null;
  notes: string | null;
  devices: Device[];
  created_at: string;
}

const API_URL = 'http://localhost:8000/api';

async function getServices(token: string): Promise<Service[]> {
  const response = await fetch(`${API_URL}/services`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Servisler alinamadi');
  return response.json();
}

async function deleteService(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_URL}/services/${id}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Servis silinemedi');
}

const BRANDS = [
  { value: 'daikin', label: 'Daikin' },
  { value: 'airfel', label: 'Airfel' },
  { value: 'vestel', label: 'Vestel' },
  { value: 'aux', label: 'AUX' },
  { value: 'other', label: 'Diger' },
];

const DEVICE_TYPES = [
  { value: 'wall', label: 'Duvar Tipi' },
  { value: 'floor', label: 'Salon Tipi' },
  { value: 'cassette', label: 'Kaset Tipi' },
  { value: 'duct', label: 'Kanal Tipi' },
];

const SERVICE_TYPES = [
  { value: 'installation', label: 'Montaj' },
  { value: 'maintenance', label: 'Bakim' },
  { value: 'repair', label: 'Tamir' },
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede',
  scheduled: 'Planlanmis',
  in_progress: 'Devam Ediyor',
  completed: 'Tamamlandi',
  cancelled: 'Iptal',
};

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const servicesData = await getServices(token);
      setServices(servicesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (service: Service) => {
    if (!confirm('Bu servis kaydini silmek istediginize emin misiniz?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await deleteService(token, service.id);
      setServices(services.filter((s) => s.id !== service.id));
      setSuccess('Servis kaydi silindi');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Servis silinemedi');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-black">Yukleniyor...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-black">Servis / Montaj Kayitlari</h2>
          <button
            onClick={() => router.push('/panel/services/create')}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-zinc-800 text-white text-sm rounded-md hover:bg-zinc-700 transition-colors"
          >
            Yeni Servis Kaydi
          </button>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">{success}</div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
        )}

        {/* Desktop Table */}
        <div className="hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-black">Musteri</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-black">Tip</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-black">Durum</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-black">Teknisyen</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-black">Randevu</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-black">Cihaz</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-black">Islemler</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b hover:bg-zinc-50">
                  <td className="py-3 px-4 text-sm text-black">{service.customer?.name}</td>
                  <td className="py-3 px-4 text-sm text-black">
                    {SERVICE_TYPES.find((t) => t.value === service.type)?.label}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        service.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : service.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-700'
                          : service.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {STATUS_LABELS[service.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-black">
                    {service.technician?.name || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-black">
                    {service.scheduled_date
                      ? `${new Date(service.scheduled_date).toLocaleDateString('tr-TR')}${service.scheduled_time ? ' ' + service.scheduled_time : ''}`
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-black">{service.devices?.length || 0} cihaz</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => router.push(`/panel/services/${service.id}`)}
                      className="text-sm text-black hover:text-zinc-600 mr-4"
                    >
                      Detay
                    </button>
                    <button
                      onClick={() => handleDelete(service)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-black">
                    Henuz servis kaydi yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-4">
          {services.map((service) => (
            <div key={service.id} className="bg-zinc-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-black text-sm">{service.customer?.name}</h3>
                  <p className="text-xs text-zinc-600 mt-1">
                    {SERVICE_TYPES.find((t) => t.value === service.type)?.label}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    service.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : service.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-700'
                      : service.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {STATUS_LABELS[service.status]}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div>
                  <span className="text-zinc-600">Teknisyen:</span>
                  <p className="text-black font-medium">{service.technician?.name || '-'}</p>
                </div>
                <div>
                  <span className="text-zinc-600">Cihaz:</span>
                  <p className="text-black font-medium">{service.devices?.length || 0} adet</p>
                </div>
                {service.scheduled_date && (
                  <div className="col-span-2">
                    <span className="text-zinc-600">Randevu:</span>
                    <p className="text-black font-medium">
                      {new Date(service.scheduled_date).toLocaleDateString('tr-TR')}
                      {service.scheduled_time ? ' ' + service.scheduled_time : ''}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/panel/services/${service.id}`)}
                  className="flex-1 min-h-[44px] px-4 py-2 bg-zinc-800 text-white text-sm rounded-md hover:bg-zinc-700 transition-colors"
                >
                  Detay Göster
                </button>
                <button
                  onClick={() => handleDelete(service)}
                  className="min-h-[44px] px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
          
          {services.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-black mb-4">Henüz servis kaydı yok</p>
              <button
                onClick={() => router.push('/panel/services/create')}
                className="min-h-[44px] px-6 py-2 bg-zinc-800 text-white text-sm rounded-md hover:bg-zinc-700 transition-colors"
              >
                İlk Servis Kaydını Oluştur
              </button>
            </div>
          )}
        </div>
      </div>
  );
}
