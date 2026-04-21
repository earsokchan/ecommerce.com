'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLang } from '../../providers/lang_provider';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Sidebar from '@/components/sidebar';
import { CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import {
  createInvoice,
  deleteInvoice,
  type Invoice as DbInvoice,
  listInvoices,
  listPendingInvoices,
  updateInvoice,
} from './actions';

// ⭐ Import the invoice preview component
import { InvoicePreview } from './invoices';

// ---------------------- TYPES -------------------------
type InvoiceItem = {
  name: string;
  price: number;
  size: string;
  quantity: number;
  productImage: string;
  color: string;
};

type Invoice = DbInvoice & {
  _id: string;
  name: string;
  province: string;
  address: string;
  phoneNumber: string;
  note: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: InvoiceItem[];
  txnId: string;
  date: string;
};

type InvoiceStatus = {
  txnId: string;
  status: string;
  lastChecked: string;
};

// --------------------- SMALL UI COMPONENT ----------------------
const DashboardCard = ({
  title,
  value,
  variant = 'neutral',
}: {
  title: string;
  value: React.ReactNode;
  variant?: 'success' | 'danger' | 'neutral';
}) => {
  const base = 'p-3 rounded-lg shadow flex flex-col items-start';
  const variants: Record<string, string> = {
    success:
      'bg-gradient-to-r from-green-100 to-green-50 border border-green-200 text-green-900',
    danger:
      'bg-gradient-to-r from-red-100 to-red-50 border border-red-200 text-red-900',
    neutral: 'bg-white border border-gray-200 text-gray-800',
  };
  return (
    <div className={`${base} ${variants[variant]}`}>
      <div className="text-xs font-medium uppercase tracking-wider">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
};

// ---------------------------------------------------------------
// ----------------------- MAIN COMPONENT ------------------------
// ---------------------------------------------------------------
export default function Payments() {
  const { t } = useLang();
  const [showDialog, setShowDialog] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

  // ⭐ Invoice dialog state
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [invoiceData, setInvoiceData] = useState<Invoice | null>(null);

  // ⭐ View invoice details state
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // ⭐ Pending invoices state
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [currentView, setCurrentView] = useState<'invoices' | 'pending'>('invoices');

  // ⭐ Invoice status state
  const [invoiceStatuses, setInvoiceStatuses] = useState<Record<string, InvoiceStatus>>({});
  const [checkingStatus, setCheckingStatus] = useState<Record<string, boolean>>({});

  const TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imhlbmdzb3Rob24iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzU1NDA1OTEsImV4cCI6MTc3ODEzMjU5MX0.EbwnPvdaXHJC2RPreoGfHD1rF39UtElcgDQkC-ryoxo';


  const [formData, setFormData] = useState({
    name: '',
    province: '',
    address: '',
    phoneNumber: '',
    note: '',
    shipping: '',
  });

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Filter controls
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [viewRange, setViewRange] = useState<'day' | 'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // -------------------- SUBTOTAL HELPERS -----------------------
  const calculateTotal = (inv: Invoice) => {
    return inv.subtotal + inv.shipping;
  };

  // ------------------ FETCH INVOICES ---------------------------
  const fetchInvoices = async () => {
    try {
      const data = await listInvoices();
      setInvoices(data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      toast.error(t('Failed to fetch invoices'));
    }
  };

  // ⭐ Fetch pending invoices
  const fetchPendingInvoices = async () => {
    try {
      const data = await listPendingInvoices();
      setPendingInvoices(data);
      setCurrentView('pending');
    } catch (err) {
      console.error('Error fetching pending invoices:', err);
      toast.error(t('Failed to fetch pending invoices'));
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // ------------------ FORM HANDLING ---------------------------
  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        province: formData.province,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        note: formData.note,
        shipping: Number(formData.shipping),
      };

      if (editingInvoiceId) {
        await updateInvoice(editingInvoiceId, payload);
        toast.success(t('Invoice updated successfully'));
        setEditingInvoiceId(null);
      } else {
        await createInvoice(payload);
        toast.success(t('Invoice created successfully'));
      }

      setShowDialog(false);
      setFormData({
        name: '',
        province: '',
        address: '',
        phoneNumber: '',
        note: '',
        shipping: '',
      });

      fetchInvoices();
    } catch (err) {
      console.error('Error saving invoice:', err);
      toast.error(t('Failed to save invoice'));
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setFormData({
      name: invoice.name,
      province: invoice.province,
      address: invoice.address,
      phoneNumber: invoice.phoneNumber,
      note: invoice.note,
      shipping: String(invoice.shipping),
    });

    setEditingInvoiceId(invoice._id);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('Are you sure you want to delete this invoice?'))) return;
    try {
      await deleteInvoice(id);
      setInvoices(invoices.filter((inv) => inv._id !== id));
      setPendingInvoices(pendingInvoices.filter((inv) => inv._id !== id));
      toast.success(t('Invoice deleted successfully'));
    } catch (err) {
      console.error('Error deleting invoice:', err);
      toast.error(t('Failed to delete invoice'));
    }
  };

  // ------------------ PRINT INVOICE ---------------------------
  const handlePrintInvoice = (invoice: Invoice) => {
    setInvoiceData(invoice);
    setShowInvoiceDialog(true);
  };

  // ⭐ Handle View Invoice Details
  const handleViewInvoice = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setShowViewDialog(true);
  };

  // ------------------ FILTERING ---------------------------
  const isInSelectedRange = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const s = new Date(selectedDate);
    if (viewRange === 'day') {
      return (
        d.getFullYear() === s.getFullYear() &&
        d.getMonth() === s.getMonth() &&
        d.getDate() === s.getDate()
      );
    }
    if (viewRange === 'month') {
      return d.getFullYear() === s.getFullYear() && d.getMonth() === s.getMonth();
    }
    if (viewRange === 'year') {
      if (selectedYear === 'all') return true;
      return d.getFullYear() === parseInt(selectedYear);
    }
    return true;
  };

  const filteredInvoices = invoices.filter((inv) => {
    const dateOk = selectedDate ? isInSelectedRange(inv.date) : true;
    return dateOk;
  });

  const filteredCount = filteredInvoices.length;
  const filteredTotalAmount = filteredInvoices.reduce(
    (sum, inv) => sum + calculateTotal(inv),
    0
  );

  // Calculate stats for pending invoices
  const pendingCount = pendingInvoices.length;
  const pendingTotalAmount = pendingInvoices.reduce(
    (sum, inv) => sum + calculateTotal(inv),
    0
  );

  // ⭐ Check invoice status from external API
  const checkInvoiceStatus = async (txnId: string) => {
    try {
      setCheckingStatus((prev) => ({ ...prev, [txnId]: true }));

      const res = await axios.get(
        `https://api-target-v2-production.up.railway.app/phillipbank/api/get/status/${txnId}`,{
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      // Map txn_status to user-friendly status
      const txnStatus = res.data.data?.txn_status || 'unknown';
      const mappedStatus = txnStatus === 'SUCCESS' ? 'SUCCESS' : 
                          txnStatus === 'PENDING' ? 'PENDING' : 
                          txnStatus.toLowerCase();

      const statusData: InvoiceStatus = {
        txnId,
        status: mappedStatus,
        lastChecked: new Date().toISOString(),
      };

      setInvoiceStatuses((prev) => ({
        ...prev,
        [txnId]: statusData,
      }));

      toast.success(t('Status checked successfully'));
    } catch (err) {
      console.error('Error checking invoice status:', err);
      toast.error(t('Failed to check invoice status'));
    } finally {
      setCheckingStatus((prev) => ({ ...prev, [txnId]: false }));
    }
  };

  // ⭐ Check all pending invoices status
  const checkAllPendingStatus = async () => {
    try {
      setCheckingStatus(Object.fromEntries(pendingInvoices.map((inv) => [inv.txnId, true])));

      for (const invoice of pendingInvoices) {
        await checkInvoiceStatus(invoice.txnId);
      }

      toast.success(t('All statuses checked'));
    } catch (err) {
      console.error('Error checking all statuses:', err);
      toast.error(t('Failed to check all statuses'));
    }
  };

  // ⭐ Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ------------------ RENDER ---------------------------
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6 bg-gray-100 ml-0 md:ml-64">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-blue-500" />
            {currentView === 'invoices' ? t('Invoices') : t('Pending Invoices')}
          </h1>
          <div className="flex gap-2">
            {currentView === 'pending' && (
              <>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={checkAllPendingStatus}
                >
                  ✓ {t('Check All Status')}
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setCurrentView('invoices')}
                >
                  ← {t('Back to Invoices')}
                </Button>
              </>
            )}
            {currentView === 'invoices' && (
              <Button
                className="bg-orange-600 hover:bg-orange-700"
                onClick={fetchPendingInvoices}
              >
                📋 {t('Pending Invoices')}
              </Button>
            )}
            
          </div>
        </div>

        {/* Show filters and cards only for invoices view */}
        {currentView === 'invoices' && (
          <>
            {/* Filters */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Label className="text-sm">{t('View')}</Label>
                <Select
                  value={viewRange}
                  onValueChange={(v) => setViewRange(v as 'day' | 'month' | 'year')}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">{t('Day')}</SelectItem>
                    <SelectItem value="month">{t('Month')}</SelectItem>
                    <SelectItem value="year">{t('Year')}</SelectItem>
                  </SelectContent>
                </Select>

                {viewRange === 'year' ? (
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('View All Years')}</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                )}
              </div>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              <DashboardCard title={t('Total Invoices')} value={filteredCount} variant="neutral" />
              <DashboardCard
                title={t('Total Amount')}
                value={`$${filteredTotalAmount.toFixed(2)}`}
                variant="neutral"
              />
            </div>
          </>
        )}

        {/* Show stats for pending invoices view */}
        {currentView === 'pending' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <DashboardCard title={t('Pending Invoices')} value={pendingCount} variant="neutral" />
            <DashboardCard
              title={t('Total Amount')}
              value={`$${pendingTotalAmount.toFixed(2)}`}
              variant="neutral"
            />
          </div>
        )}

        {/* Invoice Table - Show when on invoices view */}
        {currentView === 'invoices' && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">{t('Invoice List')}</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="max-h-[650px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Transaction ID')}</TableHead>
                      <TableHead>{t('Customer Name')}</TableHead>
                      <TableHead>{t('Province')}</TableHead>
                      <TableHead>{t('Phone')}</TableHead>
                      <TableHead>{t('Subtotal')}</TableHead>
                      <TableHead>{t('Shipping')}</TableHead>
                      <TableHead>{t('Total')}</TableHead>
                      <TableHead>{t('Items')}</TableHead>
                      <TableHead>{t('Date')}</TableHead>
                      <TableHead>{t('Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map((inv) => (
                        <TableRow key={inv._id}>
                          <TableCell className="font-semibold">{inv.txnId}</TableCell>
                          <TableCell>{inv.name}</TableCell>
                          <TableCell>{inv.province}</TableCell>
                          <TableCell>{inv.phoneNumber}</TableCell>
                          <TableCell>${inv.subtotal.toFixed(2)}</TableCell>
                          <TableCell>${inv.shipping.toFixed(2)}</TableCell>

                          <TableCell>
                            <span className="font-semibold text-green-700">
                              ${calculateTotal(inv).toFixed(2)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {inv.items.length} {t('item(s)')}
                            </span>
                          </TableCell>

                          <TableCell>
                            {new Date(inv.date).toLocaleDateString()}
                          </TableCell>

                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleViewInvoice(inv)}>
                                {t('View')}
                              </Button>

                              <Button variant="outline" size="sm" onClick={() => handleEdit(inv)}>
                                {t('Edit')}
                              </Button>

                              <Button variant="destructive" size="sm" onClick={() => handleDelete(inv._id)}>
                                {t('Delete')}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <td colSpan={10} className="text-center text-gray-500 p-4">
                          {t('No invoices found for the selected filters')}
                        </td>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Invoices Table - Show when on pending view */}
        {currentView === 'pending' && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">{t('Pending Invoices List')}</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="max-h-[650px] overflow-y-auto">
                {pendingInvoices.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('Transaction ID')}</TableHead>
                        <TableHead>{t('Customer Name')}</TableHead>
                        <TableHead>{t('Province')}</TableHead>
                        <TableHead>{t('Phone')}</TableHead>
                        <TableHead>{t('Subtotal')}</TableHead>
                        <TableHead>{t('Shipping')}</TableHead>
                        <TableHead>{t('Total')}</TableHead>
                        <TableHead>{t('Items')}</TableHead>
                        <TableHead>{t('Date')}</TableHead>
                        <TableHead>{t('Status')}</TableHead>
                        <TableHead>{t('Actions')}</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {pendingInvoices.map((inv) => (
                        <TableRow key={inv._id}>
                          <TableCell className="font-semibold">{inv.txnId}</TableCell>
                          <TableCell>{inv.name}</TableCell>
                          <TableCell>{inv.province}</TableCell>
                          <TableCell>{inv.phoneNumber}</TableCell>
                          <TableCell>${inv.subtotal.toFixed(2)}</TableCell>
                          <TableCell>${inv.shipping.toFixed(2)}</TableCell>

                          <TableCell>
                            <span className="font-semibold text-green-700">
                              ${calculateTotal(inv).toFixed(2)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {inv.items.length} {t('item(s)')}
                            </span>
                          </TableCell>

                          <TableCell>
                            {new Date(inv.date).toLocaleDateString()}
                          </TableCell>

                          <TableCell>
                            {invoiceStatuses[inv.txnId] ? (
                              <div className="flex flex-col gap-1">
                                <span className={`text-sm px-2 py-1 rounded font-medium ${getStatusBadgeColor(invoiceStatuses[inv.txnId].status)}`}>
                                  {invoiceStatuses[inv.txnId].status}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(invoiceStatuses[inv.txnId].lastChecked).toLocaleTimeString()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">{t('Not checked')}</span>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                className="bg-purple-600 text-white hover:bg-purple-700"
                                onClick={() => checkInvoiceStatus(inv.txnId)}
                                disabled={checkingStatus[inv.txnId]}
                              >
                                {checkingStatus[inv.txnId] ? t('Checking...') : t('Check Status')}
                              </Button>

                              <Button
                                size="sm"
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() => handleViewInvoice(inv)}
                              >
                                {t('View')}
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(inv)}
                              >
                                {t('Edit')}
                              </Button>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(inv._id)}
                              >
                                {t('Delete')}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-gray-500 py-8">{t('No pending invoices found')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice Add/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingInvoiceId ? t('Edit Invoice') : t('Add New Invoice')}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>{t('Customer Name')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>{t('Province')}</Label>
                <Input
                  value={formData.province}
                  onChange={(e) =>
                    setFormData({ ...formData, province: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>{t('Address')}</Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>{t('Phone Number')}</Label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>{t('Note')}</Label>
                <Input
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>{t('Shipping ($)')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.shipping}
                  onChange={(e) =>
                    setFormData({ ...formData, shipping: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                {t('Cancel')}
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>
                {editingInvoiceId ? t('Update') : t('Save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invoice Print Dialog */}
        <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{t('Invoice Preview')}</DialogTitle>
            </DialogHeader>

            {invoiceData && <InvoicePreview data={invoiceData} />}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
                {t('Close')}
              </Button>
              {/* <Button className="bg-blue-600 hover:bg-blue-700" onClick={printInvoice}>
                {t('Print')}
              </Button> */}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Invoice Details Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('Invoice Details')}</DialogTitle>
            </DialogHeader>

            {viewingInvoice && (
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('Customer Information')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">{t('Customer Name')}</p>
                      <p className="font-semibold text-gray-800">{viewingInvoice.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('Phone Number')}</p>
                      <p className="font-semibold text-gray-800">{viewingInvoice.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('Province')}</p>
                      <p className="font-semibold text-gray-800">{viewingInvoice.province}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('Address')}</p>
                      <p className="font-semibold text-gray-800">{viewingInvoice.address}</p>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('Order Information')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">{t('Transaction ID')}</p>
                      <p className="font-semibold text-gray-800">{viewingInvoice.txnId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('Date')}</p>
                      <p className="font-semibold text-gray-800">{new Date(viewingInvoice.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('Items')}</h3>
                  <div className="space-y-3">
                    {viewingInvoice.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-1">
                            <p>{t('Size')}: <span className="font-medium text-gray-800">{item.size}</span></p>
                            <p>{t('Color')}: <span className="font-medium text-gray-800">{item.color}</span></p>
                            <p>{t('Quantity')}: <span className="font-medium text-gray-800">{item.quantity}</span></p>
                            <p>{t('Price')}: <span className="font-medium text-gray-800">${item.price.toFixed(2)}</span></p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('Pricing Summary')}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-gray-600">{t('Subtotal')}</p>
                      <p className="font-semibold text-gray-800">${viewingInvoice.subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">{t('Shipping')}</p>
                      <p className="font-semibold text-gray-800">${viewingInvoice.shipping.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <p className="text-lg font-semibold text-gray-800">{t('Total')}</p>
                      <p className="text-lg font-semibold text-green-700">${calculateTotal(viewingInvoice).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {viewingInvoice.note && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">{t('Notes')}</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{viewingInvoice.note}</p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                {t('Close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
