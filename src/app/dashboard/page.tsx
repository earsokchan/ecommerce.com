'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import DashboardCard from '../../components/DashboardCard';
import Sidebar from '../../components/sidebar';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { ChartContainer } from '@mui/x-charts/ChartContainer';
import { AreaPlot } from '@mui/x-charts/LineChart';

import { DollarSign, ShoppingCart, Users, BarChart, Calendar, Download, X, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { useLang } from '../providers/lang_provider';
import { useRouter } from 'next/navigation';

// ---------------- TYPES ----------------///ß
interface Floor { _id: string; floor_number: string; }
interface Room { _id: string; room_number: string; room_price: number; status?: boolean; floor?: Floor; }
interface UserRent { _id: string; user_name: string; user_contact: string; rent_date: string; room?: Room; }
interface PaymentUser { moto_fee?: string; _id?: string; }
interface UserPayment { 
  _id: string; 
  status: string; 
  water_price: number; 
  electricity_price: number; 
  other_fee: number; 
  room?: Room; 
  user?: PaymentUser; 
  user_id?: string; 
  rent_date?: string; 
  createdAt?: string; 
}

interface Invoice {
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

// Month Picker Component with translation
const MonthPicker = ({ 
  selectedMonth, 
  onMonthSelect, 
  isOpen, 
  onClose 
}: { 
  selectedMonth: Date | null;
  onMonthSelect: (date: Date) => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const { t } = useLang();
  
  if (!isOpen) return null;

  const monthNames = [
    t("January"), t("February"), t("March"), t("April"), t("May"), t("June"), 
    t("July"), t("August"), t("September"), t("October"), t("November"), t("December")
  ];

  const handleMonthSelect = (monthIndex: number) => {
    const date = new Date(currentYear, monthIndex, 1);
    onMonthSelect(date);
  };

  const goToPreviousYear = () => {
    setCurrentYear(prev => prev - 1);
  };

  const goToNextYear = () => {
    setCurrentYear(prev => prev + 1);
  };

  return (
    <div className="absolute z-50 mt-2">
      <div className="bg-white rounded-lg shadow-xl w-80 max-w-sm border">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">{t("Select Month")}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Year Navigation */}
          <div className="flex justify-between items-center mb-4">
            <button onClick={goToPreviousYear} className="p-2 hover:bg-gray-100 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-semibold">
              {currentYear}
            </span>
            <button onClick={goToNextYear} className="p-2 hover:bg-gray-100 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Months Grid */}
          <div className="grid grid-cols-3 gap-2">
            {monthNames.map((month, index) => {
              const isSelected = selectedMonth && 
                selectedMonth.getMonth() === index && 
                selectedMonth.getFullYear() === currentYear;
              
              return (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(index)}
                  className={`py-2 px-3 rounded text-sm ${
                    isSelected 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {month}
                </button>
              );
            })}
          </div>

          {/* Selected month display */}
          {selectedMonth && (
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
              {t("Selected")}: {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Pending Payment Modal Component with translation
const PendingPaymentModal = ({ 
  isOpen, 
  onClose, 
  pendingPayments 
}: { 
  isOpen: boolean;
  onClose: () => void;
  pendingPayments: Invoice[];
}) => {
  const { t } = useLang();

  if (!isOpen) return null;

  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + (p.total || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-yellow-500" />
            {t("Recent Invoices")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-blue-800">{t("Total Amount")}</h3>
              <span className="text-2xl font-bold text-blue-700">${totalPendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <p className="text-sm text-blue-600 mt-2">
              {pendingPayments.length} {t("invoice(s)")}
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Customer")}</TableHead>
                  <TableHead>{t("Phone")}</TableHead>
                  <TableHead>{t("Location")}</TableHead>
                  <TableHead>{t("Amount")}</TableHead>
                  <TableHead>{t("Date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPayments.map(invoice => (
                  <TableRow key={invoice._id}>
                    <TableCell className="font-medium">{invoice.name}</TableCell>
                    <TableCell>{invoice.phoneNumber}</TableCell>
                    <TableCell>{invoice.province}</TableCell>
                    <TableCell className="font-semibold">
                      ${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.date).toLocaleDateString()}
                    </TableCell> 
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {pendingPayments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {t("No invoices found")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------- MAIN COMPONENT ----------------
export default function Dashboard() {
  const { t } = useLang();
  const router = useRouter();
  
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const m = new Date();
    return `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedYear, setSelectedYear] = useState(() => String(new Date().getFullYear()));
  const [paymentView, setPaymentView] = useState<'paid' | 'pending'>('paid');
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [printRange, setPrintRange] = useState<'thisMonth' | 'thisYear' | 'custom'>('thisMonth');
  
  const [showStartMonthPicker, setShowStartMonthPicker] = useState(false);
  const [showEndMonthPicker, setShowEndMonthPicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');

  // Fetch invoices from API
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

    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const apiToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imhlbmdzb3Rob24iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzU1NDA1OTEsImV4cCI6MTc3ODEzMjU5MX0.EbwnPvdaXHJC2RPreoGfHD1rF39UtElcgDQkC-ryoxo'; // Add this line
        const response = await fetch('https://api.targetclothe.online/api/invoices', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch invoices');
        }

        const data = await response.json();
        setInvoices(Array.isArray(data) ? data : data.data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [router]);

  const parseDateFromInvoice = (invoice: Invoice): Date | null => {
    try {
      const d = new Date(invoice.date);
      if (!isNaN(d.getTime())) return d;
    } catch {
      return null;
    }
    return null;
  };

  // FILTERS
  const filteredInvoices = invoices.filter(invoice => {
    const d = parseDateFromInvoice(invoice);
    if (!d) return false;
    
    if (viewMode === 'monthly') { 
      const [y, m] = selectedMonth.split('-').map(Number); 
      const start = new Date(y, m - 1, 1); 
      const end = new Date(y, m, 1); 
      return d >= start && d < end; 
    }
    if (viewMode === 'yearly') { 
      return d.getFullYear() === Number(selectedYear); 
    }
    return true;
  });

  // Calculate totals for ALL invoices
  const totalAmountAllMonths = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalItemsAllMonths = invoices.reduce((sum, inv) => sum + (inv.items?.length || 0), 0);
  const totalCustomers = new Set(invoices.map(inv => inv.phoneNumber)).size;
  const totalInvoices = invoices.length;
  const avgInvoiceAmount = totalInvoices > 0 ? totalAmountAllMonths / totalInvoices : 0;

  // MONTHLY CHART
  const months = [
    t("Jan"), t("Feb"), t("Mar"), t("Apr"), t("May"), t("Jun"), 
    t("Jul"), t("Aug"), t("Sep"), t("Oct"), t("Nov"), t("Dec")
  ];

  const monthlyPaymentData = months.map((monthLabel, i) => {
    const monthInvoices = invoices.filter(inv => {
      const d = parseDateFromInvoice(inv);
      if (!d) return false;
      return d.getMonth() === i && d.getFullYear() === Number(selectedYear);
    });
    const total = monthInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    return { month: monthLabel, total };
  });

  // Print chart function with range selection
  const chartToPrintRef = useRef<HTMLDivElement>(null);
  
  const getPrintData = (): { title: string; data: Array<{month: string; total: number}>; totalAmount: number } => {
    const now = new Date();
    let title = '';
    let data: Array<{month: string; total: number}> = [];
    let totalAmount = 0;

    switch (printRange) {
      case 'thisMonth':
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        data = monthlyPaymentData.filter((_, i) => i === currentMonth);
        title = `${t('Invoices')} - ${months[currentMonth]} ${currentYear}`;
        totalAmount = data[0]?.total || 0;
        break;

      case 'thisYear':
        data = monthlyPaymentData;
        title = `${t('Invoices')} - ${selectedYear}`;
        totalAmount = data.reduce((sum, item) => sum + item.total, 0);
        break;

      case 'custom':
        if (startDate && endDate) {
          const startMonth = startDate.getMonth();
          const endMonth = endDate.getMonth();
          const startYear = startDate.getFullYear();
          const endYear = endDate.getFullYear();
          
          data = monthlyPaymentData.filter((_, i) => {
            const monthDate = new Date(parseInt(selectedYear), i, 15);
            const monthValue = monthDate.getFullYear() * 12 + monthDate.getMonth();
            const startValue = startYear * 12 + startMonth;
            const endValue = endYear * 12 + endMonth;
            return monthValue >= startValue && monthValue <= endValue;
          });
          
          title = `${t('Invoices')} - ${months[startMonth]} ${startYear} ${t('to')} ${months[endMonth]} ${endYear}`;
          totalAmount = data.reduce((sum, item) => sum + item.total, 0);
        }
        break;
    }

    return { title, data, totalAmount };
  };

  const handlePrintChart = () => {
    if (printRange === 'custom' && (!startDate || !endDate)) {
      alert(t('Please select both start and end dates for custom range'));
      return;
    }
    setShowInvoicePreview(true);
  };

  const handleStartMonthSelect = (date: Date) => {
    setStartDate(date);
    setShowStartMonthPicker(false);
  };

  const handleEndMonthSelect = (date: Date) => {
    setEndDate(date);
    setShowEndMonthPicker(false);
  };

  const { title: printTitle, data: printData, totalAmount: printTotalAmount } = getPrintData();

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-6 bg-gray-100 ml-0 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold">{t("Loading invoices...")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100 ml-0 md:ml-64">
        
        {/* WELCOME BACK SECTION */}
        {username && (
          <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 shadow-sm">
            <p className="text-sm text-green-600 font-semibold uppercase tracking-wide">{t("Welcome Back")}</p>
            <p className="text-3xl font-bold text-green-800 mt-2">{username}</p>
            <p className="text-sm text-green-700 mt-2">{new Date().toLocaleDateString()}</p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPendingModal(true)}
              className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <AlertCircle className="h-4 w-4" />
              {t("View All Invoices")}
            </Button>
          </div>
        </div>

        {/* CARDS */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Total Revenue Gauge */}
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">{t("Total Revenue")}</h3>
              <Gauge
                value={Math.min(100, (totalAmountAllMonths / 10000) * 100)}
                startAngle={0}
                endAngle={360}
                cornerRadius="50%"
                sx={(theme) => ({
                  [`& .${gaugeClasses.valueText}`]: {
                    fontSize: 24,
                    fontWeight: 'bold',
                  },
                  [`& .${gaugeClasses.valueArc}`]: {
                    fill: '#10b981',
                    filter: 'drop-shadow(0 0 2px rgba(16, 185, 129, 0.8)) drop-shadow(0 0 7px rgba(16, 185, 129, 0.4))',
                  },
                  [`& .${gaugeClasses.referenceArc}`]: {
                    fill: theme.palette.text.disabled,
                  },
                })}
                width={150}
                height={150}
              />
              <p className="text-sm font-bold text-green-600 mt-2 text-center">
                ${totalAmountAllMonths.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Income This Week Gauge */}
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">{t("Income This Week")}</h3>
              {(() => {
                const now = new Date();
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 7);
                
                const weekIncome = invoices.reduce((sum, inv) => {
                  const invDate = parseDateFromInvoice(inv);
                  if (invDate && invDate >= startOfWeek && invDate < endOfWeek) {
                    return sum + (inv.total || 0);
                  }
                  return sum;
                }, 0);

                return (
                  <>
                    <Gauge
                      value={Math.min(100, (weekIncome / 100) * 100)}
                      startAngle={0}
                      endAngle={360}
                      cornerRadius="50%"
                      sx={(theme) => ({
                        [`& .${gaugeClasses.valueText}`]: {
                          fontSize: 24,
                          fontWeight: 'bold',
                        },
                        [`& .${gaugeClasses.valueArc}`]: {
                          fill: '#3b82f6',
                          filter: 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 7px rgba(59, 130, 246, 0.4))',
                        },
                        [`& .${gaugeClasses.referenceArc}`]: {
                          fill: theme.palette.text.disabled,
                        },
                      })}
                      width={150}
                      height={150}
                    />
                    <p className="text-sm font-bold text-blue-600 mt-2 text-center">
                      ${weekIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </>
                );
              })()}
            </div>

            {/* Income Today Gauge */}
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">{t("Income Today")}</h3>
              {(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                
                const todayIncome = invoices.reduce((sum, inv) => {
                  const invDate = parseDateFromInvoice(inv);
                  if (invDate && invDate >= today && invDate < tomorrow) {
                    return sum + (inv.total || 0);
                  }
                  return sum;
                }, 0);

                return (
                  <>
                    <Gauge
                      value={Math.min(100, (todayIncome / 100) * 100)}
                      startAngle={0}
                      endAngle={360}
                      cornerRadius="50%"
                      sx={(theme) => ({
                        [`& .${gaugeClasses.valueText}`]: {
                          fontSize: 24,
                          fontWeight: 'bold',
                        },
                        [`& .${gaugeClasses.valueArc}`]: {
                          fill: '#a855f7',
                          filter: 'drop-shadow(0 0 2px rgba(168, 85, 247, 0.8)) drop-shadow(0 0 7px rgba(168, 85, 247, 0.4))',
                        },
                        [`& .${gaugeClasses.referenceArc}`]: {
                          fill: theme.palette.text.disabled,
                        },
                      })}
                      width={150}
                      height={150}
                    />
                    <p className="text-sm font-bold text-purple-600 mt-2 text-center">
                      ${todayIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </>
                );
              })()}
            </div>

            {/* Income This Year Gauge */}
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">{t("Income This Year")}</h3>
              {(() => {
                const currentYear = new Date().getFullYear();
                const yearIncome = invoices.reduce((sum, inv) => {
                  const invDate = parseDateFromInvoice(inv);
                  if (invDate && invDate.getFullYear() === currentYear) {
                    return sum + (inv.total || 0);
                  }
                  return sum;
                }, 0);

                return (
                  <>
                    <Gauge
                      value={Math.min(100, (yearIncome / 10000) * 100)}
                      startAngle={0}
                      endAngle={360}
                      cornerRadius="50%"
                      sx={(theme) => ({
                        [`& .${gaugeClasses.valueText}`]: {
                          fontSize: 24,
                          fontWeight: 'bold',
                        },
                        [`& .${gaugeClasses.valueArc}`]: {
                          fill: '#ec4899',
                          filter: 'drop-shadow(0 0 2px rgba(236, 72, 153, 0.8)) drop-shadow(0 0 7px rgba(236, 72, 153, 0.4))',
                        },
                        [`& .${gaugeClasses.referenceArc}`]: {
                          fill: theme.palette.text.disabled,
                        },
                      })}
                      width={150}
                      height={150}
                    />
                    <p className="text-sm font-bold text-pink-600 mt-2 text-center">
                      ${yearIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </>
                );
              })()}
            </div>

            {/* This Month Gauge */}
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">{t("This Month")}</h3>
              <Gauge
                value={Math.min(100, (filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0) / 1000) * 100)}
                startAngle={0}
                endAngle={360}
                cornerRadius="50%"
                sx={(theme) => ({
                  [`& .${gaugeClasses.valueText}`]: {
                    fontSize: 24,
                    fontWeight: 'bold',
                  },
                  [`& .${gaugeClasses.valueArc}`]: {
                    fill: '#f59e0b',
                    filter: 'drop-shadow(0 0 2px rgba(245, 158, 11, 0.8)) drop-shadow(0 0 7px rgba(245, 158, 11, 0.4))',
                  },
                  [`& .${gaugeClasses.referenceArc}`]: {
                    fill: theme.palette.text.disabled,
                  },
                })}
                width={150}
                height={150}
              />
              <p className="text-sm font-bold text-yellow-600 mt-2 text-center">
                ${filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* MONTHLY CHART */}
        <Card className="mb-6 relative">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {t('Invoices by Month')} ({selectedYear})
              </CardTitle>
              <div className="flex items-center space-x-2">
                {/* Print Range Selection */}
                <div className="flex items-center space-x-2 mr-4">
                  <select 
                    value={printRange}
                    onChange={(e) => setPrintRange(e.target.value as 'thisMonth' | 'thisYear' | 'custom')}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="thisMonth">{t("This Month")}</option>
                    <option value="thisYear">{t("This Year")}</option>
                    <option value="custom">{t("Custom Range")}</option>
                  </select>

                  {printRange === 'custom' && (
                    <div className="flex items-center space-x-2 relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowStartMonthPicker(true)}
                        className="flex items-center space-x-2"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>{startDate ? `${months[startDate.getMonth()]} ${startDate.getFullYear()}` : t('Start Month')}</span>
                      </Button>
                      {showStartMonthPicker && (
                        <div className="absolute top-full left-0 z-50">
                          <MonthPicker
                            selectedMonth={startDate}
                            onMonthSelect={handleStartMonthSelect}
                            isOpen={showStartMonthPicker}
                            onClose={() => setShowStartMonthPicker(false)}
                          />
                        </div>
                      )}
                      <span>{t("to")}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEndMonthPicker(true)}
                        className="flex items-center space-x-2"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>{endDate ? `${months[endDate.getMonth()]} ${endDate.getFullYear()}` : t('End Month')}</span>
                      </Button>
                      {showEndMonthPicker && (
                        <div className="absolute top-full left-0 z-50">
                          <MonthPicker
                            selectedMonth={endDate}
                            onMonthSelect={handleEndMonthSelect}
                            isOpen={showEndMonthPicker}
                            onClose={() => setShowEndMonthPicker(false)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button onClick={handlePrintChart} variant="outline" size="sm" className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>{t("Print Chart")}</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full h-72" ref={chartToPrintRef}>
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={monthlyPaymentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

     
        {/* INVOICE PREVIEW MODAL */}
        {showInvoicePreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">{t("Chart Preview")} - {printTitle}</h2>
                <button
                  onClick={() => setShowInvoicePreview(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl ml-4"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-lg font-semibold">{t("Total Amount")}: ${printTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ReBarChart data={printData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* INVOICES MODAL */}
        <PendingPaymentModal 
          isOpen={showPendingModal}
          onClose={() => setShowPendingModal(false)}
          pendingPayments={invoices}
        />

        {/* RECENT INVOICES TABLE */}
        <Card>
          <CardHeader><CardTitle>{t("Recent Invoices")}</CardTitle></CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Customer")}</TableHead>
                    <TableHead>{t("Phone")}</TableHead>
                    <TableHead>{t("Location")}</TableHead>
                    <TableHead>{t("Items")}</TableHead>
                    <TableHead>{t("Total")}</TableHead>
                    <TableHead>{t("Date")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.slice(0, 10).map(invoice => (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-medium">{invoice.name}</TableCell>
                      <TableCell>{invoice.phoneNumber}</TableCell>
                      <TableCell>{invoice.province}</TableCell>
                      <TableCell>{invoice.items?.length || 0}</TableCell>
                      <TableCell className="font-semibold">
                        ${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}