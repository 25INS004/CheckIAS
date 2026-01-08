import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Tag, Calendar, Users, Percent, DollarSign, CheckCircle, XCircle, ChevronDown, Copy, BarChart2, Check } from 'lucide-react';
import Toast from '../../components/Toast';
import RefreshButton from '../../components/RefreshButton';
import Pagination from '../../components/Pagination';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import DatePicker from '../../components/DatePicker';
import TimePicker from '../../components/TimePicker';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  applicable_plans: string[];
  valid_from: string;
  valid_until: string | null;
  max_uses: number | null;
  max_uses_per_user: number;
  uses_count: number;
  is_active: boolean;
  created_at: string;
}

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDiscountTypeOpen, setIsDiscountTypeOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    min_purchase: 0,
    applicable_plans: ['starter', 'pro', 'achiever'],
    valid_from: new Date().toISOString().split('T')[0],
    valid_from_time: '00:00',
    valid_until: '',
    valid_until_time: '23:59',
    max_uses: '',
    max_uses_per_user: 1,
    is_active: true
  });

  const fetchCoupons = async (background = false) => {
    if (!background) setLoading(true);
    try {
      const token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (!token) throw new Error('Not authenticated');
      const { currentSession } = JSON.parse(token);
      const accessToken = currentSession?.access_token;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/coupons?select=*&order=created_at.desc`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch coupons');
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      if (!background) setToast({ message: 'Failed to load coupons', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  useAutoRefresh(() => fetchCoupons(true));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (!token) throw new Error('Not authenticated');
      const { currentSession } = JSON.parse(token);
      const accessToken = currentSession?.access_token;

      const body = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        min_purchase: formData.min_purchase,
        applicable_plans: formData.applicable_plans,
        valid_from: new Date(`${formData.valid_from}T${formData.valid_from_time}`).toISOString(),
        valid_until: formData.valid_until ? new Date(`${formData.valid_until}T${formData.valid_until_time}`).toISOString() : null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        max_uses_per_user: formData.max_uses_per_user,
        is_active: formData.is_active
      };

      const url = editingCoupon 
        ? `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/coupons?id=eq.${editingCoupon.id}`
        : `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/coupons`;

      const res = await fetch(url, {
        method: editingCoupon ? 'PATCH' : 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(await res.text());

      setToast({ message: editingCoupon ? 'Coupon updated!' : 'Coupon created!', type: 'success' });
      setShowModal(false);
      resetForm();
      fetchCoupons();
    } catch (err) {
      console.error('Error saving coupon:', err);
      setToast({ message: 'Failed to save coupon', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (!token) throw new Error('Not authenticated');
      const { currentSession } = JSON.parse(token);
      const accessToken = currentSession?.access_token;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/coupons?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete');

      setToast({ message: 'Coupon deleted', type: 'success' });
      setDeleteConfirm(null);
      fetchCoupons();
    } catch (err) {
      console.error('Error deleting coupon:', err);
      setToast({ message: 'Failed to delete coupon', type: 'error' });
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      const token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (!token) throw new Error('Not authenticated');
      const { currentSession } = JSON.parse(token);
      const accessToken = currentSession?.access_token;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/coupons?id=eq.${coupon.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !coupon.is_active })
      });

      if (!res.ok) throw new Error('Failed to update');
      fetchCoupons();
    } catch (err) {
      console.error('Error toggling coupon:', err);
      setToast({ message: 'Failed to update coupon', type: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_purchase: 0,
      applicable_plans: ['starter', 'pro', 'achiever'],
      valid_from: new Date().toISOString().split('T')[0],
      valid_from_time: '00:00',
      valid_until: '',
      valid_until_time: '23:59',
      max_uses: '',
      max_uses_per_user: 1,
      is_active: true
    });
    setEditingCoupon(null);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_purchase: coupon.min_purchase,
      applicable_plans: coupon.applicable_plans,
      valid_from: new Date(new Date(coupon.valid_from).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
      valid_from_time: new Date(coupon.valid_from).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      valid_until: coupon.valid_until ? new Date(new Date(coupon.valid_until).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0] : '',
      valid_until_time: coupon.valid_until ? new Date(coupon.valid_until).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '23:59',
      max_uses: coupon.max_uses?.toString() || '',
      max_uses_per_user: coupon.max_uses_per_user,
      is_active: coupon.is_active
    });
    setShowModal(true);
  };

  const copyCode = async (code: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
        setToast({ message: 'Code copied!', type: 'success' });
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setToast({ message: 'Code copied!', type: 'success' });
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err);
          setToast({ message: 'Failed to copy code', type: 'error' });
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      setToast({ message: 'Failed to copy code', type: 'error' });
    }
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coupon.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isExpired = (coupon: Coupon) => {
    if (!coupon.valid_until) return false;
    return new Date(coupon.valid_until) < new Date();
  };

  const isMaxedOut = (coupon: Coupon) => {
    if (!coupon.max_uses) return false;
    return coupon.uses_count >= coupon.max_uses;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupon Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage promotional codes</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onClick={() => fetchCoupons()} />
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by code or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
              <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{coupons.length}</p>
              <p className="text-xs text-gray-500">Total Coupons</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{coupons.filter(c => c.is_active && !isExpired(c) && !isMaxedOut(c)).length}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <BarChart2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{coupons.reduce((acc, c) => acc + c.uses_count, 0)}</p>
              <p className="text-xs text-gray-500">Total Uses</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{coupons.filter(c => !c.is_active || isExpired(c) || isMaxedOut(c)).length}</p>
              <p className="text-xs text-gray-500">Inactive/Expired</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading coupons...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No coupons found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Plans</th>
                  <th className="px-6 py-4">Validity</th>
                  <th className="px-6 py-4">Usage</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredCoupons
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {coupon.code}
                        </span>
                        <button onClick={() => copyCode(coupon.code)} className="text-gray-400 hover:text-gray-600">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {coupon.discount_type === 'percentage' ? (
                          <>
                            <Percent className="w-4 h-4 text-green-500" />
                            <span className="font-bold text-green-600 dark:text-green-400">{coupon.discount_value}%</span>
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-green-600 dark:text-green-400">₹{coupon.discount_value}</span>
                          </>
                        )}
                        <span className="text-gray-500 text-xs ml-1">off</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {coupon.applicable_plans.map(plan => (
                          <span key={plan} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs rounded-full capitalize">
                            {plan}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(coupon.valid_from).toLocaleDateString()}
                      </div>
                      {coupon.valid_until && (
                        <div className={`flex items-center gap-1 mt-0.5 ${isExpired(coupon) ? 'text-red-500' : ''}`}>
                          → {new Date(coupon.valid_until).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">{coupon.uses_count}</span>
                        {coupon.max_uses && (
                          <span className="text-gray-400">/ {coupon.max_uses}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(coupon)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          isExpired(coupon) 
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                            : isMaxedOut(coupon)
                              ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                              : coupon.is_active
                                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                                : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {isExpired(coupon) ? (
                          <>Expired</>
                        ) : isMaxedOut(coupon) ? (
                          <>Max Reached</>
                        ) : coupon.is_active ? (
                          <><CheckCircle className="w-3 h-3" /> Active</>
                        ) : (
                          <><XCircle className="w-3 h-3" /> Inactive</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(coupon.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          totalPages={Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE)}
          onPageChange={setCurrentPage}
          totalItems={filteredCoupons.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="WELCOME50"
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white uppercase"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="50% off for new users"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Type</label>
                  <button
                    type="button"
                    onClick={() => setIsDiscountTypeOpen(!isDiscountTypeOpen)}
                    onBlur={() => setTimeout(() => setIsDiscountTypeOpen(false), 200)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white flex items-center justify-between"
                  >
                    <span>{formData.discount_type === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDiscountTypeOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDiscountTypeOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-20 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, discount_type: 'percentage' });
                          setIsDiscountTypeOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${formData.discount_type === 'percentage' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        Percentage (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, discount_type: 'fixed' });
                          setIsDiscountTypeOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${formData.discount_type === 'fixed' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        Fixed Amount (₹)
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount Value {formData.discount_type === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.discount_type === 'percentage' ? 100 : undefined}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid From</label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-grow">
                      <DatePicker
                        value={formData.valid_from}
                        onChange={(date) => setFormData({ ...formData, valid_from: date })}
                        placeholder="Select start date"
                      />
                    </div>
                    <TimePicker
                      value={formData.valid_from_time}
                      onChange={(time) => setFormData({ ...formData, valid_from_time: time })}
                      className="w-36"
                      align="right"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid Until (optional)</label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-grow">
                      <DatePicker
                        value={formData.valid_until}
                        onChange={(date) => setFormData({ ...formData, valid_until: date })}
                        placeholder="Select end date"
                        min={formData.valid_from}
                      />
                    </div>
                    <TimePicker
                      value={formData.valid_until_time}
                      onChange={(time) => setFormData({ ...formData, valid_until_time: time })}
                      className="w-36"
                      align="right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Uses (total)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Uses Per User</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_uses_per_user}
                    onChange={(e) => setFormData({ ...formData, max_uses_per_user: parseInt(e.target.value) || 1 })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Applicable Plans</label>
                  <div className="flex flex-wrap gap-4">
                    {['starter', 'pro', 'achiever'].map(plan => (
                      <label key={plan} className="flex items-center gap-2 cursor-pointer group">
                        <button
                          type="button"
                          onClick={() => {
                            const plans = formData.applicable_plans.includes(plan)
                              ? formData.applicable_plans.filter(p => p !== plan)
                              : [...formData.applicable_plans, plan];
                            setFormData({ ...formData, applicable_plans: plans });
                          }}
                          className={`
                            w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                            ${formData.applicable_plans.includes(plan)
                              ? 'bg-indigo-600 border-indigo-600'
                              : 'border-gray-300 dark:border-gray-600 group-hover:border-indigo-400'
                            }
                          `}
                        >
                          {formData.applicable_plans.includes(plan) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{plan}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    className={`
                      w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                      ${formData.is_active
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                      }
                    `}
                  >
                    {formData.is_active && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Active (can be used immediately)</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Coupon?</h3>
              <p className="text-gray-600 dark:text-gray-400">This action cannot be undone. All usage history will be lost.</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
