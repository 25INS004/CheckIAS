import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, Calendar, Users, Filter, ChevronDown, Loader2, Eye, X } from 'lucide-react';
import RefreshButton from '../../components/RefreshButton';
import Pagination from '../../components/Pagination';
import DatePicker from '../../components/DatePicker';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '../../components/InvoicePDF';

interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  plan_purchased: string;
  amount: number;
  discount_applied: number;
  final_amount: number;
  payment_id: string;
  coupon_code: string | null;
  billing_name: string;
  billing_email: string;
  billing_phone: string | null;
  invoice_date: string;
  cgst: number;
  sgst: number;
  tax_total: number;
}

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchInvoices = async (background = false) => {
    if (!background) setLoading(true);
    try {
      const token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (!token) return;
      const { currentSession } = JSON.parse(token);
      const accessToken = currentSession?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/invoices?select=*&order=invoice_date.desc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useAutoRefresh(() => fetchInvoices(true));

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Filters
  const filteredInvoices = invoices.filter(invoice => {
    // Search filter
    const searchMatch = 
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.billing_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.billing_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.payment_id.toLowerCase().includes(searchQuery.toLowerCase());

    // Plan filter
    const planMatch = filterPlan === 'All' || invoice.plan_purchased === filterPlan.toLowerCase();

    // Date filters
    let dateMatch = true;
    if (dateFrom) {
      dateMatch = new Date(invoice.invoice_date) >= new Date(dateFrom);
    }
    if (dateTo && dateMatch) {
      dateMatch = new Date(invoice.invoice_date) <= new Date(dateTo + 'T23:59:59');
    }

    return searchMatch && planMatch && dateMatch;
  });

  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalStats = {
    count: invoices.length,
    revenue: invoices.reduce((sum, inv) => sum + inv.final_amount, 0),
    discounts: invoices.reduce((sum, inv) => sum + inv.discount_applied, 0),
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage all user invoices</p>
        </div>
        <RefreshButton onClick={() => fetchInvoices()} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{totalStats.count}</p>
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Total Invoices</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency(totalStats.revenue)}</p>
              <p className="text-xs font-medium text-green-600 dark:text-green-400">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Filter className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{formatCurrency(totalStats.discounts)}</p>
              <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Total Discounts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by invoice #, email, name, or payment ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Plan Filter */}
        <div className="relative">
          <button
            onClick={() => setIsPlanDropdownOpen(!isPlanDropdownOpen)}
            className="w-full lg:w-40 px-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-between text-gray-900 dark:text-white"
          >
            <span>{filterPlan}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isPlanDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isPlanDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-10">
              {['All', 'Starter', 'Pro', 'Achiever'].map(plan => (
                <button
                  key={plan}
                  onClick={() => { setFilterPlan(plan); setIsPlanDropdownOpen(false); }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-900 ${filterPlan === plan ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}
                >
                  {plan}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date From */}
        <div className="lg:w-44">
          <DatePicker
            value={dateFrom}
            onChange={setDateFrom}
            placeholder="From date"
          />
        </div>

        {/* Date To */}
        <div className="lg:w-44">
          <DatePicker
            value={dateTo}
            onChange={setDateTo}
            placeholder="To date"
            min={dateFrom}
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <p className="text-gray-500 mt-4">Loading invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                        {invoice.invoice_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{invoice.billing_name}</div>
                      <div className="text-xs text-gray-500">{invoice.billing_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs rounded-full capitalize">
                        {invoice.plan_purchased}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(invoice.final_amount)}</div>
                      {invoice.discount_applied > 0 && (
                        <div className="text-xs text-green-600 dark:text-green-400">-{formatCurrency(invoice.discount_applied)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(invoice.invoice_date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <PDFDownloadLink
                          document={<InvoicePDF invoice={invoice} />}
                          fileName={`${invoice.invoice_number}.pdf`}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        >
                          {({ loading: pdfLoading }) => (
                            pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />
                          )}
                        </PDFDownloadLink>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE)}
          onPageChange={setCurrentPage}
          totalItems={filteredInvoices.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedInvoice(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Details</h3>
              <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Invoice Number</p>
                  <p className="font-mono font-bold text-gray-900 dark:text-white">{selectedInvoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedInvoice.invoice_date)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Customer Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedInvoice.billing_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedInvoice.billing_email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Plan</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{selectedInvoice.plan_purchased}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment ID</p>
                  <p className="font-mono text-xs text-gray-900 dark:text-white">{selectedInvoice.payment_id}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Original Amount</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(selectedInvoice.amount)}</span>
                </div>
                {selectedInvoice.discount_applied > 0 && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Discount {selectedInvoice.coupon_code && `(${selectedInvoice.coupon_code})`}</span>
                    <span className="text-green-600">-{formatCurrency(selectedInvoice.discount_applied)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">CGST</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(selectedInvoice.cgst)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">SGST</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(selectedInvoice.sgst)}</span>
                </div>
                <div className="flex justify-between text-base font-bold mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(selectedInvoice.final_amount)}</span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-800">
              <PDFDownloadLink
                document={<InvoicePDF invoice={selectedInvoice} />}
                fileName={`${selectedInvoice.invoice_number}.pdf`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                {({ loading: pdfLoading }) => (
                  <>
                    {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {pdfLoading ? 'Generating...' : 'Download PDF'}
                  </>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoices;
