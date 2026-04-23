'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Wrench,
  Clock,
  CheckCircle,
  Calendar,
  ListTodo,
  Plus,
  Users,
  Zap,
} from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

interface Stats {
  totalCustomers: number;
  totalServices: number;
  pendingServices: number;
  completedServices: number;
  todayServices: number;
  thisMonthServices: number;
}

interface RecentService {
  id: string;
  customer_name: string;
  type: string;
  status: string;
  scheduled_date: string | null;
}

const SERVICE_TYPES: Record<string, string> = {
  installation: 'Montaj',
  maintenance: 'Bakim',
  repair: 'Tamir',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
  assigned: { label: 'Atandi', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'Devam Ediyor', color: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Tamamlandi', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Iptal', color: 'bg-red-100 text-red-800' },
};

export default function PanelPage() {
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    totalServices: 0,
    pendingServices: 0,
    completedServices: 0,
    todayServices: 0,
    thisMonthServices: 0,
  });
  const [recentServices, setRecentServices] = useState<RecentService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const customersRes = await fetch(`${API_URL}/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const customers = await customersRes.json();

      const servicesRes = await fetch(`${API_URL}/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const services = await servicesRes.json();

      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7);

      setStats({
        totalCustomers: Array.isArray(customers) ? customers.length : 0,
        totalServices: Array.isArray(services) ? services.length : 0,
        pendingServices: Array.isArray(services)
          ? services.filter((s: { status: string }) => s.status === 'pending').length
          : 0,
        completedServices: Array.isArray(services)
          ? services.filter((s: { status: string }) => s.status === 'completed').length
          : 0,
        todayServices: Array.isArray(services)
          ? services.filter((s: { scheduled_date: string | null }) => s.scheduled_date === today).length
          : 0,
        thisMonthServices: Array.isArray(services)
          ? services.filter((s: { scheduled_date: string | null }) => s.scheduled_date?.startsWith(thisMonth)).length
          : 0,
      });

      if (Array.isArray(services)) {
        const recent = services.slice(0, 5).map((s: { id: string; customer?: { name: string }; type: string; status: string; scheduled_date: string | null }) => ({
          id: s.id,
          customer_name: s.customer?.name || '-',
          type: s.type,
          status: s.status,
          scheduled_date: s.scheduled_date,
        }));
        setRecentServices(recent);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Hosgeldiniz!</h1>
        <p className="text-zinc-300">
          Teknik Servis Yonetim Paneli. Bugun {stats.todayServices} randevunuz var.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Musteri"
          value={stats.totalCustomers}
          icon={<Building2 size={24} />}
          color="bg-blue-50 border-blue-200"
          iconBg="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Toplam Servis"
          value={stats.totalServices}
          icon={<Wrench size={24} />}
          color="bg-purple-50 border-purple-200"
          iconBg="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Bekleyen Servis"
          value={stats.pendingServices}
          icon={<Clock size={24} />}
          color="bg-yellow-50 border-yellow-200"
          iconBg="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          title="Tamamlanan"
          value={stats.completedServices}
          icon={<CheckCircle size={24} />}
          color="bg-green-50 border-green-200"
          iconBg="bg-green-100 text-green-600"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-100">
          <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-zinc-500" />
            Bugunun Ozeti
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg">
              <span className="text-zinc-600">Bugunun Randevulari</span>
              <span className="text-xl font-bold text-zinc-800">{stats.todayServices}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg">
              <span className="text-zinc-600">Bu Ayin Servisleri</span>
              <span className="text-xl font-bold text-zinc-800">{stats.thisMonthServices}</span>
            </div>
          </div>
        </div>

        {/* Recent Services */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-100">
          <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
            <ListTodo size={20} className="text-zinc-500" />
            Son Servisler
          </h3>
          {recentServices.length > 0 ? (
            <div className="space-y-3">
              {recentServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-zinc-800">{service.customer_name}</p>
                    <p className="text-sm text-zinc-500">
                      {SERVICE_TYPES[service.type] || service.type}
                      {service.scheduled_date && ` • ${service.scheduled_date}`}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      STATUS_LABELS[service.status]?.color || 'bg-zinc-100 text-zinc-800'
                    }`}
                  >
                    {STATUS_LABELS[service.status]?.label || service.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-8">Henuz servis kaydi yok</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-100">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
          <Zap size={20} className="text-zinc-500" />
          Hizli Islemler
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            href="/panel/services/create"
            icon={<Plus size={24} />}
            label="Yeni Servis"
            color="bg-zinc-800 text-white hover:bg-zinc-700"
          />
          <QuickAction
            href="/panel/customers"
            icon={<Building2 size={24} />}
            label="Musteriler"
            color="bg-blue-50 text-blue-700 hover:bg-blue-100"
          />
          <QuickAction
            href="/panel/services"
            icon={<Wrench size={24} />}
            label="Servis Listesi"
            color="bg-purple-50 text-purple-700 hover:bg-purple-100"
          />
          <QuickAction
            href="/panel/users"
            icon={<Users size={24} />}
            label="Kullanicilar"
            color="bg-green-50 text-green-700 hover:bg-green-100"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  iconBg,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  iconBg: string;
}) {
  return (
    <div className={`rounded-xl p-5 border ${color}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-zinc-600">{title}</p>
          <p className="text-2xl font-bold text-zinc-800">{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-colors ${color}`}
    >
      <span className="mb-2">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
