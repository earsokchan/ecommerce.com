'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, BadgeCheck, BadgeAlert, AlertCircle, Users, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import Sidebar from '../../components/sidebar';
import { useLang } from '../providers/lang_provider';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export interface Invoice {
  _id: string;
  name: string;
  province: string;
  address: string;
  phoneNumber: string;
  note: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: Array<{
    name: string;
    price: number;
    size: string;
    quantity: number;
    productImage: string;
    color: string;
  }>;
  txnId: string;
  date: string;
}

interface DashboardClientProps {
  initialInvoices: Invoice[];
}

const StatCard = ({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  className: string;
}) => {
  return (
    <div className={`relative overflow-hidden rounded-3xl px-8 py-9 text-white shadow-lg ${className}`}>
      <div className="absolute right-[-26px] top-[-26px] h-32 w-32 rounded-full bg-white/10" />
      <div className="flex items-center gap-5">
        <div className="rounded-2xl bg-white/20 p-3.5">{icon}</div>
        <div>
          <p className="text-lg font-medium opacity-95">{title}</p>
          <p className="mt-1 text-6xl font-semibold leading-none tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
};

const PendingPaymentModal = ({
  isOpen,
  onClose,
  pendingPayments,
}: {
  isOpen: boolean;
  onClose: () => void;
  pendingPayments: Invoice[];
}) => {
  const { t } = useLang();

  if (!isOpen) return null;

  const totalAmount = pendingPayments.reduce((sum, invoice) => sum + (invoice.total || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-lg">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white p-4">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            {t('Recent Invoices')}
          </h2>
          <button onClick={onClose} className="text-2xl text-gray-600 hover:text-gray-800">
            x
          </button>
        </div>
        <div className="space-y-6 p-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-700">{t('Total Amount')}</p>
            <p className="text-3xl font-bold text-blue-800">
              ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Customer')}</TableHead>
                  <TableHead>{t('Phone')}</TableHead>
                  <TableHead>{t('Location')}</TableHead>
                  <TableHead>{t('Amount')}</TableHead>
                  <TableHead>{t('Date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPayments.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell className="font-medium">{invoice.name}</TableCell>
                    <TableCell>{invoice.phoneNumber}</TableCell>
                    <TableCell>{invoice.province}</TableCell>
                    <TableCell>
                      ${invoice.total.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardClient({ initialInvoices }: DashboardClientProps) {
  const { t } = useLang();
  const router = useRouter();

  const [invoices] = useState<Invoice[]>(initialInvoices);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [router]);

  const parseInvoiceDate = (invoice: Invoice): Date | null => {
    const date = new Date(invoice.date);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const months = [
    t('Jan'),
    t('Feb'),
    t('Mar'),
    t('Apr'),
    t('May'),
    t('Jun'),
    t('Jul'),
    t('Aug'),
    t('Sep'),
    t('Oct'),
    t('Nov'),
    t('Dec'),
  ];

  const yearlyInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const date = parseInvoiceDate(invoice);
      return date ? date.getFullYear() === Number(selectedYear) : false;
    });
  }, [invoices, selectedYear]);

  const totalAmount = useMemo(() => {
    return invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
  }, [invoices]);

  const paidAmount = totalAmount;

  const totalCustomers = useMemo(() => {
    return new Set(invoices.map((invoice) => invoice.phoneNumber)).size;
  }, [invoices]);

  const paidByDay = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return invoices.reduce((sum, invoice) => {
      const date = parseInvoiceDate(invoice);
      if (!date || date < today || date >= tomorrow) {
        return sum;
      }
      return sum + (invoice.total || 0);
    }, 0);
  }, [invoices]);

  const paidByMonth = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return invoices.reduce((sum, invoice) => {
      const date = parseInvoiceDate(invoice);
      if (!date || date < monthStart || date >= nextMonth) {
        return sum;
      }
      return sum + (invoice.total || 0);
    }, 0);
  }, [invoices]);

  const donutData = [
    { name: t('Paid'), value: paidAmount },
  ];

  const monthlyTrendData = months.map((month, monthIndex) => {
    const total = yearlyInvoices.reduce((sum, invoice) => {
      const date = parseInvoiceDate(invoice);
      if (!date || date.getMonth() !== monthIndex) {
        return sum;
      }
      return sum + (invoice.total || 0);
    }, 0);

    return { month, total };
  });

  const availableYears = Array.from(
    new Set(
      invoices
        .map((invoice) => parseInvoiceDate(invoice)?.getFullYear())
        .filter((year): year is number => typeof year === 'number')
    )
  )
    .sort((a, b) => b - a)
    .map(String);

  return (
    <div className="flex min-h-screen bg-slate-200/60">
      <Sidebar />

      <main className="ml-0 flex-1 p-4 md:ml-64 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t('Dashboard')}</h1>
            {username && <p className="mt-1 text-sm text-slate-600">{t('Welcome Back')}, {username}</p>}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
            >
              {(availableYears.length > 0 ? availableYears : [selectedYear]).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => setShowPendingModal(true)}
              className="rounded-xl border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              {t('View All Invoices')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title={t('Customer')}
            value={totalCustomers.toString()}
            icon={<Users className="h-6 w-6" />}
            className="bg-gradient-to-r from-blue-500 to-blue-700"
          />
          <StatCard
            title={t('Paid By Day')}
            value={`$${paidByDay.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={<CalendarDays className="h-6 w-6" />}
            className="bg-gradient-to-r from-fuchsia-500 to-pink-600"
          />
          <StatCard
            title={t('Paid By Month')}
            value={`$${paidByMonth.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={<BadgeCheck className="h-6 w-6" />}
            className="bg-gradient-to-r from-blue-600 to-indigo-700"
          />
          <StatCard
            title={t('Total Amount')}
            value={`$${totalAmount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={<DollarSign className="h-6 w-6" />}
            className="bg-gradient-to-r from-emerald-500 to-teal-700"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="rounded-3xl border-0 bg-slate-100/90 shadow-md">
            <CardHeader>
              <CardTitle className="text-3xl font-semibold text-slate-800">{t('Invoice Overview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={72}
                      outerRadius={120}
                      stroke="none"
                      label={({ percent, name }) => `${name} ${Math.round((percent || 0) * 100)}%`}
                    >
                      <Cell fill="#ec4899" />
                      <Cell fill="#3b82f6" />
                    </Pie>
                    <Legend verticalAlign="bottom" align="center" iconType="circle" />
                    <Tooltip formatter={(value: number) => value.toLocaleString('en-US')} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 bg-slate-100/90 shadow-md">
            <CardHeader>
              <CardTitle className="text-3xl font-semibold text-slate-800">{t('Invoice Trend')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="invoiceAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                    <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
                    <YAxis tick={{ fill: '#64748b' }} />
                    <Tooltip
                      formatter={(value: number) =>
                        `$${value.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      strokeWidth={4}
                      fill="url(#invoiceAreaGradient)"
                      dot={{ r: 4, fill: '#3b82f6' }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 rounded-3xl border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>{t('Recent Invoices')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Customer')}</TableHead>
                    <TableHead>{t('Phone')}</TableHead>
                    <TableHead>{t('Location')}</TableHead>
                    <TableHead>{t('Items')}</TableHead>
                    <TableHead>{t('Total')}</TableHead>
                    <TableHead>{t('Date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yearlyInvoices.slice(0, 10).map((invoice) => (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-medium">{invoice.name}</TableCell>
                      <TableCell>{invoice.phoneNumber}</TableCell>
                      <TableCell>{invoice.province}</TableCell>
                      <TableCell>{invoice.items?.length || 0}</TableCell>
                      <TableCell className="font-semibold">
                        ${invoice.total.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <PendingPaymentModal
          isOpen={showPendingModal}
          onClose={() => setShowPendingModal(false)}
          pendingPayments={invoices}
        />
      </main>
    </div>
  );
}
