'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

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
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  type: 'individual' | 'company';
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
  notes: string;
}

interface Technician {
  id: string;
  name: string;
  email: string;
}

interface ServiceDocument {
  id: string;
  name: string;
  original_name: string;
  path: string;
  mime_type: string;
  size: number;
  created_at: string;
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
  representative_notes: string | null;
  technician: Technician | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  completed_date: string | null;
  completion_notes: string | null;
  notes: string | null;
  devices: Device[];
  documents?: ServiceDocument[];
  created_at: string;
}

const API_URL = 'http://localhost:8000/api';

const SERVICE_TYPES: Record<string, string> = {
  installation: 'Montaj',
  maintenance: 'Bakim',
  repair: 'Tamir',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede',
  scheduled: 'Planlandi',
  in_progress: 'Devam Ediyor',
  completed: 'Tamamlandi',
  cancelled: 'Iptal',
};

const BRANDS: Record<string, string> = {
  daikin: 'Daikin',
  airfel: 'Airfel',
  vestel: 'Vestel',
  aux: 'AUX',
  other: 'Diger',
};

const DEVICE_TYPES: Record<string, string> = {
  wall: 'Duvar Tipi',
  floor: 'Salon Tipi',
  cassette: 'Kaset Tipi',
  duct: 'Kanalli',
};

async function getService(token: string, id: string): Promise<Service> {
  const response = await fetch(`${API_URL}/services/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error('Servis bulunamadi');
  return response.json();
}

async function completeService(token: string, id: string, data: { completion_notes: string }): Promise<void> {
  const response = await fetch(`${API_URL}/services/${id}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Servis tamamlanamadi');
}

async function uploadDocuments(token: string, id: string, files: File[]): Promise<void> {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`documents[${index}]`, file);
  });

  const response = await fetch(`${API_URL}/services/${id}/documents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData,
  });
  if (!response.ok) throw new Error('Belgeler yuklenemedi');
}

export default function ServiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadService = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const data = await getService(token, id);
      setService(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata olustu');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadService();
  }, [loadService]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleComplete = async () => {
    const token = localStorage.getItem('token');
    if (!token || !service) return;

    setSubmitting(true);
    setError('');

    try {
      if (uploadedFiles.length > 0) {
        await uploadDocuments(token, service.id, uploadedFiles);
      }

      await completeService(token, service.id, {
        completion_notes: completionNotes,
      });

      setShowCompleteModal(false);
      setCompletionNotes('');
      setUploadedFiles([]);
      loadService();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Islem basarisiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-black">Yukleniyor...</p>
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="space-y-4 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => router.push('/panel/services')}
            className="text-sm text-black hover:text-zinc-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg sm:text-2xl font-bold text-black">Servis Detayi</h1>
          <span
            className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
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

        {service.status !== 'completed' && service.status !== 'cancelled' && (
          <button
            onClick={() => setShowCompleteModal(true)}
            className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium text-sm sm:text-base min-h-[44px]"
          >
            Servisi Tamamla
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Musteri Bilgileri */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-black mb-4 border-b pb-2">Musteri Bilgileri</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
          <div>
            <span className="text-black/60">Musteri:</span>
            <p className="font-medium text-black">{service.customer?.name}</p>
          </div>
          <div>
            <span className="text-black/60">Telefon:</span>
            <p className="font-medium text-black">{service.customer?.phone}</p>
          </div>
          <div>
            <span className="text-black/60">Sube:</span>
            <p className="font-medium text-black">
              {service.branch ? `${service.branch.name} - ${service.branch.address}` : '-'}
            </p>
          </div>
          <div>
            <span className="text-black/60">Iletisim Kisisi:</span>
            <p className="font-medium text-black">
              {service.contact ? `${service.contact.name} - ${service.contact.phone}` : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Servis Bilgileri */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-black mb-4 border-b pb-2">Servis Bilgileri</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
          <div>
            <span className="text-black/60">Servis Tipi:</span>
            <p className="font-medium text-black">{SERVICE_TYPES[service.type]}</p>
          </div>
          <div>
            <span className="text-black/60">Kesif Gerekli:</span>
            <p className="font-medium text-black">{service.has_inspection ? 'Evet' : 'Hayir'}</p>
          </div>
          <div>
            <span className="text-black/60">Olusturulma:</span>
            <p className="font-medium text-black">
              {new Date(service.created_at).toLocaleDateString('tr-TR')}
            </p>
          </div>
          <div>
            <span className="text-black/60">Teknisyen:</span>
            <p className="font-medium text-black">{service.technician?.name || '-'}</p>
          </div>
        </div>
      </div>

      {/* Randevu Bilgileri */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-black mb-4 border-b pb-2">Randevu Bilgileri</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
          <div>
            <span className="text-black/60">Randevu Tarihi:</span>
            <p className="font-medium text-black">
              {service.scheduled_date
                ? new Date(service.scheduled_date).toLocaleDateString('tr-TR')
                : '-'}
            </p>
          </div>
          <div>
            <span className="text-black/60">Randevu Saati:</span>
            <p className="font-medium text-black">{service.scheduled_time || '-'}</p>
          </div>
          {service.completed_date && (
            <div>
              <span className="text-black/60">Tamamlanma Tarihi:</span>
              <p className="font-medium text-black">
                {new Date(service.completed_date).toLocaleDateString('tr-TR')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notlar */}
      {(service.inspection_notes || service.representative_notes || service.notes || service.completion_notes) && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-black mb-4 border-b pb-2">Notlar</h2>
          <div className="space-y-4 text-sm">
            {service.inspection_notes && (
              <div>
                <span className="text-black/60 font-medium">Kesif Notlari:</span>
                <p className="text-black mt-1 bg-gray-50 p-3 rounded">{service.inspection_notes}</p>
              </div>
            )}
            {service.representative_notes && (
              <div>
                <span className="text-black/60 font-medium">Temsilci Notlari:</span>
                <p className="text-black mt-1 bg-gray-50 p-3 rounded">{service.representative_notes}</p>
              </div>
            )}
            {service.notes && (
              <div>
                <span className="text-black/60 font-medium">Genel Notlar:</span>
                <p className="text-black mt-1 bg-gray-50 p-3 rounded">{service.notes}</p>
              </div>
            )}
            {service.completion_notes && (
              <div>
                <span className="text-black/60 font-medium">Tamamlanma Notlari:</span>
                <p className="text-black mt-1 bg-green-50 p-3 rounded">{service.completion_notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cihazlar */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-black mb-4 border-b pb-2">
          Cihazlar ({service.devices?.length || 0})
        </h2>
        {service.devices?.length > 0 ? (
          <div className="space-y-4">
            {service.devices.map((device, idx) => (
              <div key={device.id || idx} className="border rounded-lg p-3 sm:p-4 bg-gray-50">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-black/60">Marka:</span>
                    <p className="font-medium text-black">
                      {BRANDS[device.brand] || device.brand_other || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-black/60">Tip:</span>
                    <p className="font-medium text-black">{DEVICE_TYPES[device.device_type] || '-'}</p>
                  </div>
                  <div>
                    <span className="text-black/60">BTU:</span>
                    <p className="font-medium text-black">{device.btu || '-'}</p>
                  </div>
                  <div>
                    <span className="text-black/60">Adet:</span>
                    <p className="font-medium text-black">{device.quantity || 1}</p>
                  </div>
                </div>

                {(device.indoor_model || device.outdoor_model) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-black/60">Ic Unite Model:</span>
                      <p className="text-black">{device.indoor_model || '-'}</p>
                    </div>
                    <div>
                      <span className="text-black/60">Dis Unite Model:</span>
                      <p className="text-black">{device.outdoor_model || '-'}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-black/60">Kat:</span>
                    <p className="text-black">{device.floor ?? '-'}</p>
                  </div>
                  <div>
                    <span className="text-black/60">Asansor:</span>
                    <p className="text-black">
                      {device.has_elevator === true ? 'Var' : device.has_elevator === false ? 'Yok' : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-black/60">Otopark:</span>
                    <p className="text-black">
                      {device.has_parking === true ? 'Var' : device.has_parking === false ? 'Yok' : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-black/60">Dis Unite Yeri:</span>
                    <p className="text-black">{device.outdoor_unit_location || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-black/60">Forklift:</span>
                    <p className="text-black">
                      {device.needs_forklift === true ? 'Gerekli' : device.needs_forklift === false ? 'Gereksiz' : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-black/60">Iskele:</span>
                    <p className="text-black">
                      {device.needs_scaffold === true ? 'Gerekli' : device.needs_scaffold === false ? 'Gereksiz' : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-black/60">Elektrik:</span>
                    <p className="text-black">
                      {device.electrical_ready === true ? 'Hazir' : device.electrical_ready === false ? 'Hazir Degil' : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-black/60">Delme:</span>
                    <p className="text-black">
                      {device.needs_drilling === true ? 'Gerekli' : device.needs_drilling === false ? 'Gereksiz' : '-'}
                    </p>
                  </div>
                </div>

                {device.notes && (
                  <div className="mt-3 pt-3 border-t text-xs sm:text-sm">
                    <span className="text-black/60">Cihaz Notlari:</span>
                    <p className="text-black mt-1 break-words">{device.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-black/60">Cihaz bilgisi yok</p>
        )}
      </div>

      {/* Belgeler */}
      {service.documents && service.documents.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-black mb-4 border-b pb-2">
            Belgeler ({service.documents.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {service.documents.map((doc) => (
              <a
                key={doc.id}
                href={`${API_URL}/services/${service.id}/documents/${doc.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors text-center min-h-[100px] flex flex-col justify-center"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 flex items-center justify-center bg-zinc-100 rounded">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-xs sm:text-sm font-medium text-black truncate px-1">{doc.original_name}</p>
                <p className="text-xs text-black/60">{formatFileSize(doc.size)}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Tamamlama Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white">
              <h3 className="text-base sm:text-lg font-semibold text-black">Servisi Tamamla</h3>
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setCompletionNotes('');
                  setUploadedFiles([]);
                }}
                className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded hover:bg-zinc-100 min-h-[44px] sm:min-h-0"
              >
                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Aciklama */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Tamamlanma Aciklamasi
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={4}
                  className="w-full border rounded-lg px-3 sm:px-4 py-3 text-sm sm:text-base text-black focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[120px]"
                  placeholder="Yapilan islemler, notlar..."
                />
              </div>

              {/* Belge Yukleme */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Belgeler (Fotograf, Fatura, vb.)
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
                    isDragging
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 flex items-center justify-center bg-zinc-100 rounded-full">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base text-black font-medium mb-1">Dosyalari surukleyip birakin</p>
                  <p className="text-black/60 text-sm mb-3">veya</p>
                  <label className="px-4 py-3 bg-zinc-100 text-black rounded cursor-pointer hover:bg-zinc-200 inline-block text-sm sm:text-base min-h-[44px] flex items-center">
                    Dosya Sec
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="image/*,.pdf,.doc,.docx"
                    />
                  </label>
                  <p className="text-xs text-black/50 mt-3">Desteklenen formatlar: Resim, PDF, Word</p>
                </div>
              </div>

              {/* Yuklenen Dosyalar */}
              {uploadedFiles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Yuklenecek Dosyalar ({uploadedFiles.length})
                  </label>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border rounded-lg p-3 bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center bg-zinc-100 rounded">
                            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-black">{file.name}</p>
                            <p className="text-xs text-black/60">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-100"
                        >
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50 sticky bottom-0">
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setCompletionNotes('');
                  setUploadedFiles([]);
                }}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 border rounded text-black hover:bg-gray-100 min-h-[44px]"
                disabled={submitting}
              >
                Iptal
              </button>
              <button
                onClick={handleComplete}
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium disabled:opacity-50 min-h-[44px]"
              >
                {submitting ? 'Isleniyor...' : 'Tamamla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
