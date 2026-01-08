import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  brandName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#4f46e5',
  },
  brandTagline: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#4f46e5',
  },
  invoiceNumber: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    color: '#374151',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowLabel: {
    color: '#6b7280',
  },
  rowValue: {
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#4f46e5',
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#4f46e5',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 9,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  billingInfo: {
    marginBottom: 4,
  },
  planBadge: {
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
});

interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  billing_name: string;
  billing_email: string;
  billing_phone: string | null;
  plan_purchased: string;
  amount: number;
  discount_applied: number;
  final_amount: number;
  coupon_code: string | null;
  payment_id: string;
  cgst: number;
  sgst: number;
  tax_total: number;
}

interface InvoicePDFProps {
  invoice: InvoiceData;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getPlanDuration = (plan: string) => {
  switch (plan.toLowerCase()) {
    case 'starter': return '1 Month';
    case 'pro': return '3 Months';
    case 'achiever': return '6 Months';
    default: return 'Lifetime';
  }
};

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandName}>CheckIAS</Text>
          <Text style={styles.brandTagline}>UPSC Answer Evaluation</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
          <Text style={styles.invoiceNumber}>{formatDate(invoice.invoice_date)}</Text>
        </View>
      </View>

      {/* Bill To */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bill To</Text>
        <Text style={styles.billingInfo}>{invoice.billing_name}</Text>
        <Text style={styles.billingInfo}>{invoice.billing_email}</Text>
        {invoice.billing_phone && (
          <Text style={styles.billingInfo}>{invoice.billing_phone}</Text>
        )}
      </View>

      {/* Plan Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription Details</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Plan</Text>
          <Text style={styles.planBadge}>{invoice.plan_purchased}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Duration</Text>
          <Text style={styles.rowValue}>{getPlanDuration(invoice.plan_purchased)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Base Price</Text>
          <Text style={styles.rowValue}>{formatCurrency(invoice.amount)}</Text>
        </View>
        {invoice.discount_applied > 0 && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>
              Discount {invoice.coupon_code ? `(${invoice.coupon_code})` : ''}
            </Text>
            <Text style={{ ...styles.rowValue, color: '#16a34a' }}>
              -{formatCurrency(invoice.discount_applied)}
            </Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Subtotal</Text>
          <Text style={styles.rowValue}>{formatCurrency(invoice.amount - invoice.discount_applied)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>CGST (9%)</Text>
          <Text style={styles.rowValue}>{formatCurrency(invoice.cgst)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>SGST (9%)</Text>
          <Text style={styles.rowValue}>{formatCurrency(invoice.sgst)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoice.final_amount)}</Text>
        </View>
      </View>

      {/* Payment Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Information</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Transaction ID</Text>
          <Text style={styles.rowValue}>{invoice.payment_id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Payment Status</Text>
          <Text style={{ ...styles.rowValue, color: '#16a34a' }}>Paid</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Thank you for choosing CheckIAS!</Text>
        <Text style={{ marginTop: 4 }}>For support, contact: support@checkias.com</Text>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;
