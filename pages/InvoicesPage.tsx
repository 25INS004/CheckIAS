import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '../components/InvoicePDF';

interface Invoice {
  id: string;
  invoice_number: string;
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

const InvoicesPage = () => {
  const { user } = useUser();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
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

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Invoices</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View and download your payment invoices</p>
      </div>

      {/* Invoices List */}
      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <p className="text-gray-500 mt-4">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No invoices yet</h3>
            <p className="text-gray-500">Your invoices will appear here after you make a purchase.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Invoice Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                        {invoice.invoice_number}
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs rounded-full capitalize">
                        {invoice.plan_purchased}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(invoice.invoice_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {invoice.payment_id}
                      </span>
                    </div>
                  </div>

                  {/* Amount & Download */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(invoice.final_amount)}
                      </p>
                      {invoice.discount_applied > 0 && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Saved {formatCurrency(invoice.discount_applied)}
                        </p>
                      )}
                    </div>
                    <PDFDownloadLink
                      document={<InvoicePDF invoice={invoice} />}
                      fileName={`${invoice.invoice_number}.pdf`}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      {({ loading: pdfLoading }) => (
                        <>
                          {pdfLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">
                            {pdfLoading ? 'Generating...' : 'Download'}
                          </span>
                        </>
                      )}
                    </PDFDownloadLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesPage;
