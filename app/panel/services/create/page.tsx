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
  // Montaj Ortamı
  montaj_ortami: string;
  ankastre_tesisat: string;
  // Cihaz Bilgileri - Elle giriş
  brand: string;
  device_type: string;
  btu: string;
  indoor_model: string;
  outdoor_model: string;
  quantity: number;
  // Montaj Detayları
  floor: string;
  elevator: string;
  parking: string;
  forklift: string;
  scaffold: string;
  outdoor_unit_location: string;
  electrical_ready: string;
  drilling: string;
  notes: string;
}

interface Technician {
  id: string;
  name: string;
  email: string;
}

const API_URL = 'http://localhost:8000/api';

async function getCustomers(token: string): Promise<Customer[]> {
  const response = await fetch(`${API_URL}/customers`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Musteriler alinamadi');
  return response.json();
}

async function getTechnicians(token: string): Promise<Technician[]> {
  const response = await fetch(`${API_URL}/services/technicians/list`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Teknisyenler alinamadi');
  return response.json();
}

async function createService(token: string, data: unknown): Promise<unknown> {
  const response = await fetch(`${API_URL}/services`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Validation errors:', errorData);
    throw new Error(errorData.message || 'Servis olusturulamadi');
  }
  return response.json();
}

const SERVICE_TYPES = [
  { value: 'installation', label: 'Montaj' },
  { value: 'maintenance', label: 'Bakim' },
  { value: 'repair', label: 'Tamir' },
];

const YES_NO_OPTIONS = [
  { value: '', label: 'Seçiniz' },
  { value: 'yes', label: 'Evet' },
  { value: 'no', label: 'Hayır' },
  { value: 'unknown', label: 'Bilinmiyor' },
];

const MONTAJ_ORTAMI_OPTIONS = [
  { value: '', label: 'Seçiniz' },
  { value: 'dukan', label: 'Dükan' },
  { value: 'otel', label: 'Otel' },
  { value: 'villa', label: 'Villa' },
  { value: 'apartman', label: 'Apartman' },
  { value: 'mustakil', label: 'Müstakil Ev' },
  { value: 'isyeri', label: 'İşyeri' },
  { value: 'fabrika', label: 'Fabrika' },
  { value: 'depo', label: 'Depo' },
  { value: 'other', label: 'Diğer' },
];

const ANKASTRE_OPTIONS = [
  { value: '', label: 'Seçiniz' },
  { value: 'birebir', label: 'Birebir Takılacak' },
  { value: 'altyapili', label: 'Altyapılı' },
  { value: 'unknown', label: 'Bilinmiyor' },
];

const ELEVATOR_OPTIONS = [
  { value: '', label: 'Seçiniz' },
  { value: 'var', label: 'Var' },
  { value: 'yok', label: 'Yok' },
  { value: 'unknown', label: 'Bilinmiyor' },
];

const PARKING_OPTIONS = [
  { value: '', label: 'Seçiniz' },
  { value: 'var', label: 'Var (Kolay Tasima)' },
  { value: 'yok', label: 'Yok (Zor Tasima)' },
  { value: 'unknown', label: 'Bilinmiyor' },
];

const FORKLIFT_OPTIONS = [
  { value: '', label: 'Seçiniz' },
  { value: 'gerekli', label: 'Gerekli' },
  { value: 'gereksiz', label: 'Gereksiz' },
  { value: 'unknown', label: 'Bilinmiyor' },
];

const SCAFFOLD_OPTIONS = [
  { value: '', label: 'Seçiniz' },
  { value: 'gerekli', label: 'Gerekli' },
  { value: 'gereksiz', label: 'Gereksiz' },
  { value: 'unknown', label: 'Bilinmiyor' },
];

const OUTDOOR_LOCATION_OPTIONS = [
  { value: '', label: 'Seçiniz' },
  { value: 'balkon', label: 'Balkon' },
  { value: 'cati', label: 'Çatı' },
  { value: 'bahce', label: 'Bahçe' },
  { value: 'dis_duvar', label: 'Dış Duvar' },
  { value: 'teras', label: 'Teras' },
  { value: 'other', label: 'Diğer' },
  { value: 'unknown', label: 'Bilinmiyor' },
];

const ELECTRICAL_OPTIONS = [
  { value: '', label: 'Seçiniz' },
  { value: 'hazir', label: 'Hazır' },
  { value: 'degil', label: 'Hazır Değil' },
  { value: 'unknown', label: 'Bilinmiyor' },
];

const DRILLING_OPTIONS = [
  { value: '', label: 'Seçiniz' },
  { value: 'gerekli', label: 'Gerekli' },
  { value: 'gereksiz', label: 'Gereksiz' },
  { value: 'unknown', label: 'Bilinmiyor' },
];

export default function CreateServicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  // Multi-step form
  const [step, setStep] = useState(1);

  // Step 1: Customer
  const [customerId, setCustomerId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [contactId, setContactId] = useState('');
  const [serviceType, setServiceType] = useState('installation');

  // Step 2: Devices
  const [devices, setDevices] = useState<Device[]>([]);

  // Step 3: Inspection (Keşif)
  const [hasInspection, setHasInspection] = useState('no');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [representativeNotes, setRepresentativeNotes] = useState('');

  // Step 4: Technician & Schedule
  const [technicianId, setTechnicianId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const [customersData, techniciansData] = await Promise.all([
        getCustomers(token),
        getTechnicians(token),
      ]);
      setCustomers(customersData);
      setTechnicians(techniciansData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const addDevice = () => {
    setDevices([
      ...devices,
      {
        montaj_ortami: '',
        ankastre_tesisat: '',
        brand: '',
        device_type: '',
        btu: '',
        indoor_model: '',
        outdoor_model: '',
        quantity: 1,
        floor: '',
        elevator: '',
        parking: '',
        forklift: '',
        scaffold: '',
        outdoor_unit_location: '',
        electrical_ready: '',
        drilling: '',
        notes: '',
      },
    ]);
  };

  const updateDevice = (index: number, field: keyof Device, value: unknown) => {
    const updated = [...devices];
    (updated[index] as unknown as Record<string, unknown>)[field] = value;
    setDevices(updated);
  };

  const removeDevice = (index: number) => {
    setDevices(devices.filter((_, i) => i !== index));
  };

  // Device verisini backend formatına dönüştür
  const transformDeviceForBackend = (device: Device) => {
    // Geçerli brand değerleri
    const validBrands = ['daikin', 'airfel', 'vestel', 'aux', 'other'];
    const validDeviceTypes = ['wall', 'floor', 'cassette', 'duct'];
    
    const brand = validBrands.includes(device.brand) ? device.brand : undefined;
    const deviceType = validDeviceTypes.includes(device.device_type) ? device.device_type : undefined;
    
    return {
      brand: brand,
      brand_other: brand === 'other' ? device.indoor_model : undefined,
      device_type: deviceType,
      btu: device.btu || undefined,
      indoor_model: device.indoor_model || undefined,
      outdoor_model: device.outdoor_model || undefined,
      quantity: device.quantity || 1,
      floor: device.floor ? parseInt(device.floor) : undefined,
      has_elevator: device.elevator === 'var' ? true : device.elevator === 'yok' ? false : undefined,
      has_parking: device.parking === 'var' ? true : device.parking === 'yok' ? false : undefined,
      needs_forklift: device.forklift === 'gerekli' ? true : device.forklift === 'gereksiz' ? false : undefined,
      needs_scaffold: device.scaffold === 'gerekli' ? true : device.scaffold === 'gereksiz' ? false : undefined,
      outdoor_unit_location: device.outdoor_unit_location || undefined,
      electrical_ready: device.electrical_ready === 'hazir' ? true : device.electrical_ready === 'degil' ? false : undefined,
      needs_drilling: device.drilling === 'gerekli' ? true : device.drilling === 'gereksiz' ? false : undefined,
      notes: device.notes || undefined,
    };
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Oturum bulunamadi');
      setSubmitting(false);
      return;
    }

    // Validation
    if (!customerId) {
      setError('Lütfen bir müşteri seçin');
      setSubmitting(false);
      return;
    }

    const requestData = {
      customer_id: customerId,
      branch_id: branchId || null,
      contact_id: contactId || null,
      type: serviceType || 'installation',
      has_inspection: hasInspection === 'yes',
      inspection_notes: inspectionNotes || null,
      representative_notes: representativeNotes || null,
      technician_id: technicianId || null,
      scheduled_date: scheduledDate || null,
      scheduled_time: scheduledTime || null,
      notes: notes || null,
      devices: devices.length > 0 ? devices.map(transformDeviceForBackend) : undefined,
    };

    console.log('Request data:', requestData);

    try {
      await createService(token, requestData);
      router.push('/panel/services');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Islem basarisiz');
    } finally {
      setSubmitting(false);
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
        <h2 className="text-base sm:text-lg font-semibold text-black">Yeni Servis Kaydi - Adim {step}/4</h2>
        <button
          onClick={() => router.push('/panel/services')}
          className="text-sm text-black hover:text-zinc-600 self-start sm:self-auto"
        >
          Vazgec
        </button>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center gap-1 sm:gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded ${s <= step ? 'bg-zinc-800' : 'bg-zinc-200'}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-black mt-2">
          <span>Müşteri</span>
          <span>Cihazlar</span>
          <span>Keşif</span>
          <span>Randevu</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
      )}

      {/* Step 1: Customer Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Musteri *</label>
            <select
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setBranchId('');
                setContactId('');
              }}
              className="w-full min-h-[44px] px-4 py-2 border border-zinc-300 rounded-md text-black"
            >
              <option value="">Musteri secin...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.phone}
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer && (
            <>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Sube</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full min-h-[44px] px-4 py-2 border border-zinc-300 rounded-md text-black"
                >
                  <option value="">Sube secin...</option>
                  {selectedCustomer.branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} - {b.address}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Iletisim Kisisi</label>
                <select
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  className="w-full min-h-[44px] px-4 py-2 border border-zinc-300 rounded-md text-black"
                >
                  <option value="">Iletisim kisisi secin...</option>
                  {selectedCustomer.contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.phone} {c.is_default ? '(Varsayilan)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-black mb-1">Servis Tipi</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full min-h-[44px] px-4 py-2 border border-zinc-300 rounded-md text-black"
            >
              {SERVICE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Step 2: Devices */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
            <h4 className="font-medium text-black">Cihazlar</h4>
            <button
              type="button"
              onClick={addDevice}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-zinc-800 text-white text-sm rounded-md hover:bg-zinc-700 transition-colors"
            >
              + Cihaz Ekle
            </button>
          </div>

          {devices.map((device, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold text-black">Cihaz {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeDevice(idx)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Sil
                </button>
              </div>

              {/* Cihaz Bilgisi */}
              <div>
                <h5 className="text-sm font-semibold text-black mb-2 bg-zinc-100 p-2 rounded">
                  Cihaz Bilgisi
                </h5>
                <p className="text-xs text-black/60 mb-3">
                  Müşteri beyanına göre alınır. Bilinmiyorsa boş bırakabilirsiniz.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-black mb-1">Marka</label>
                    <input
                      type="text"
                      value={device.brand}
                      onChange={(e) => updateDevice(idx, 'brand', e.target.value)}
                      placeholder="Ör: Daikin, Airfel..."
                      className="w-full min-h-[44px] px-3 py-2 border border-zinc-300 rounded-md text-sm text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-black mb-1">Tip</label>
                    <input
                      type="text"
                      value={device.device_type}
                      onChange={(e) => updateDevice(idx, 'device_type', e.target.value)}
                      placeholder="Ör: Duvar, Salon, Kaset..."
                      className="w-full min-h-[44px] px-3 py-2 border border-zinc-300 rounded-md text-sm text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-black mb-1">BTU</label>
                    <input
                      type="text"
                      value={device.btu}
                      onChange={(e) => updateDevice(idx, 'btu', e.target.value)}
                      placeholder="Ör: 9000, 12000..."
                      className="w-full min-h-[44px] px-3 py-2 border border-zinc-300 rounded-md text-sm text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-xs text-black mb-1">İç Ünite Model</label>
                    <input
                      type="text"
                      value={device.indoor_model}
                      onChange={(e) => updateDevice(idx, 'indoor_model', e.target.value)}
                      placeholder="Model numarası..."
                      className="w-full min-h-[44px] px-3 py-2 border border-zinc-300 rounded-md text-sm text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-black mb-1">Dış Ünite Model</label>
                    <input
                      type="text"
                      value={device.outdoor_model}
                      onChange={(e) => updateDevice(idx, 'outdoor_model', e.target.value)}
                      placeholder="Model numarası..."
                      className="w-full min-h-[44px] px-3 py-2 border border-zinc-300 rounded-md text-sm text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-black mb-1">Adet</label>
                    <input
                      type="number"
                      min={1}
                      value={device.quantity}
                      onChange={(e) => updateDevice(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full min-h-[44px] px-3 py-2 border border-zinc-300 rounded-md text-sm text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Montaj Detayları */}
              <div>
                <h5 className="text-sm font-semibold text-black mb-2 bg-zinc-100 p-2 rounded">
                  Montaj Detayları
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-black mb-1">Ortam Tipi</label>
                    <select
                      value={device.montaj_ortami}
                      onChange={(e) => updateDevice(idx, 'montaj_ortami', e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 border border-zinc-300 rounded-md text-sm text-black"
                    >
                      {MONTAJ_ORTAMI_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-black mb-1">Ankastre (Altyapı)</label>
                    <select
                      value={device.ankastre_tesisat}
                      onChange={(e) => updateDevice(idx, 'ankastre_tesisat', e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 border border-zinc-300 rounded-md text-sm text-black"
                    >
                      {ANKASTRE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-black mb-1">Kat (0-50)</label>
                    <input
                      type="text"
                      value={device.floor}
                      onChange={(e) => updateDevice(idx, 'floor', e.target.value)}
                      placeholder="Bilinmiyorsa boş bırak"
                      className="w-full min-h-[44px] px-3 py-2 border border-zinc-300 rounded-md text-sm text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-black mb-1">Asansör</label>
                    <select
                      value={device.elevator}
                      onChange={(e) => updateDevice(idx, 'elevator', e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 border border-zinc-300 rounded-md text-sm text-black"
                    >
                      {ELEVATOR_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-xs text-black mb-1">Park / Taşıma</label>
                    <select
                      value={device.parking}
                      onChange={(e) => updateDevice(idx, 'parking', e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 border border-zinc-300 rounded-md text-sm text-black"
                    >
                      {PARKING_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-black mb-1">Forklift İhtimali</label>
                    <select
                      value={device.forklift}
                      onChange={(e) => updateDevice(idx, 'forklift', e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 border border-zinc-300 rounded-md text-sm text-black"
                    >
                      {FORKLIFT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-black mb-1">İskele İhtimali</label>
                    <select
                      value={device.scaffold}
                      onChange={(e) => updateDevice(idx, 'scaffold', e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm text-black"
                    >
                      {SCAFFOLD_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-xs text-black mb-1">Dış Ünite Konumu</label>
                    <select
                      value={device.outdoor_unit_location}
                      onChange={(e) => updateDevice(idx, 'outdoor_unit_location', e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm text-black"
                    >
                      {OUTDOOR_LOCATION_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-black mb-1">Elektrik Hattı Hazır mı?</label>
                    <select
                      value={device.electrical_ready}
                      onChange={(e) => updateDevice(idx, 'electrical_ready', e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm text-black"
                    >
                      {ELECTRICAL_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-black mb-1">Delme / Karot Gerekir mi?</label>
                    <select
                      value={device.drilling}
                      onChange={(e) => updateDevice(idx, 'drilling', e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm text-black"
                    >
                      {DRILLING_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Cihaz Notu */}
              <div>
                <label className="block text-xs text-black mb-1">Cihaz Notu</label>
                <textarea
                  value={device.notes}
                  onChange={(e) => updateDevice(idx, 'notes', e.target.value)}
                  placeholder="Bu cihaza özel notlar..."
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm text-black"
                  rows={2}
                />
              </div>
            </div>
          ))}

          {devices.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-zinc-300 rounded-lg">
              <p className="text-black mb-4">Henüz cihaz eklenmedi.</p>
              <button
                type="button"
                onClick={addDevice}
                className="px-6 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700"
              >
                + Cihaz Ekle
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Keşif */}
      {step === 3 && (
        <div className="space-y-4">
          <h4 className="font-medium text-black">Keşif</h4>
          <p className="text-sm text-black/60">Keşif var ise not ekleyin.</p>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Keşif</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-black">
                <input
                  type="radio"
                  name="hasInspection"
                  value="no"
                  checked={hasInspection === 'no'}
                  onChange={(e) => setHasInspection(e.target.value)}
                />
                Hayır
              </label>
              <label className="flex items-center gap-2 text-black">
                <input
                  type="radio"
                  name="hasInspection"
                  value="yes"
                  checked={hasInspection === 'yes'}
                  onChange={(e) => setHasInspection(e.target.value)}
                />
                Evet
              </label>
            </div>
          </div>

          {hasInspection === 'yes' && (
            <div>
              <label className="block text-sm font-medium text-black mb-1">Keşif Notu</label>
              <textarea
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                className="w-full min-h-[100px] px-4 py-2 border border-zinc-300 rounded-md text-black"
                rows={4}
                placeholder="Keşif gerekçesi / detaylar"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-black mb-1">Temsilci Notu</label>
            <textarea
              value={representativeNotes}
              onChange={(e) => setRepresentativeNotes(e.target.value)}
              className="w-full min-h-[100px] px-4 py-2 border border-zinc-300 rounded-md text-black"
              rows={4}
              placeholder="Ek açıklamalar..."
            />
          </div>
        </div>
      )}

      {/* Step 4: Technician & Schedule */}
      {step === 4 && (
        <div className="space-y-4">
          <h4 className="font-medium text-black">Teknisyen ve Randevu</h4>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Teknisyen</label>
            <select
              value={technicianId}
              onChange={(e) => setTechnicianId(e.target.value)}
              className="w-full min-h-[44px] px-4 py-2 border border-zinc-300 rounded-md text-black"
            >
              <option value="">Teknisyen secin...</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Randevu Tarihi</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full min-h-[44px] px-4 py-2 border border-zinc-300 rounded-md text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Randevu Saati</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full min-h-[44px] px-4 py-2 border border-zinc-300 rounded-md text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Genel Notlar</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[100px] px-4 py-2 border border-zinc-300 rounded-md text-black"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t mt-6">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2 border border-zinc-300 text-black rounded-md hover:bg-zinc-50 transition-colors"
          >
            Geri
          </button>
        )}
        <div className="hidden sm:block flex-1" />
        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && !customerId}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            Devam
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        )}
      </div>
    </div>
  );
}
