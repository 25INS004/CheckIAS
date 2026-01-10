import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Save, X, Trash2, CheckCircle, RefreshCcw } from 'lucide-react';
import { usePricing } from '../../hooks/usePricing';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { PricingPlan, PricingFeature } from '../../config/pricing';

const AdminPricing = () => {
  const { plans, loading, refreshPlans } = usePricing();
  const { toast } = useToast();
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PricingPlan | null>(null);

  useEffect(() => {
    if (editingPlan) {
      setFormData(JSON.parse(JSON.stringify(editingPlan)));
    } else {
      setFormData(null);
    }
  }, [editingPlan]);

  const handleInputChange = (field: keyof PricingPlan, value: any) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  const updateFeature = (index: number, field: keyof PricingFeature, value: any) => {
    if (!formData) return;
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      features: [...formData.features, { text: 'New Feature', included: true }]
    });
  };

  const removeFeature = (index: number) => {
    if (!formData) return;
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSave = async () => {
    if (!formData) return;

    try {
      setSaving(true);
      
      // Get auth token from storage
      const stored = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (!stored) {
        throw new Error('Not authenticated. Please log in again.');
      }
      const { currentSession } = JSON.parse(stored);
      const token = currentSession?.access_token;
      
      if (!token) {
        throw new Error('Session expired. Please log in again.');
      }

      const dbPayload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        display_price: formData.displayPrice,
        period: formData.period,
        billing_note: formData.billingNote,
        button_text: formData.buttonText,
        is_popular: formData.isPopular,
        features: formData.features
      };

      // Use direct fetch instead of Supabase SDK
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/pricing_plans?id=eq.${formData.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(dbPayload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Update failed: ${response.status} - ${errorText}`);
      }

      toast.success('Plan updated successfully');
      setEditingPlan(null);
      refreshPlans();
    } catch (err: any) {
      console.error('Error updating plan:', err);
      toast.error('Failed to update plan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pricing Plans</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage subscription plans and pricing</p>
        </div>
        <button 
          onClick={() => refreshPlans()}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Refresh Plans"
        >
          <RefreshCcw className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{plan.id}</p>
                </div>
                {plan.isPopular && (
                  <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold px-2 py-1 rounded-full">
                    POPULAR
                  </span>
                )}
              </div>
              
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{plan.displayPrice}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{plan.period}</span>
              </div>

              <div className="space-y-2 mb-6 h-48 overflow-y-auto custom-scrollbar">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <CheckCircle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${feature.included ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`} />
                    <span className={!feature.included ? 'line-through opacity-60' : ''}>{feature.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setEditingPlan(plan)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors font-medium text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPlan && formData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit {editingPlan.title}</h2>
              <button 
                onClick={() => setEditingPlan(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Price (Numeric)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Display Price</label>
                  <input
                    type="text"
                    value={formData.displayPrice}
                    onChange={(e) => handleInputChange('displayPrice', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Period</label>
                  <input
                    type="text"
                    value={formData.period}
                    onChange={(e) => handleInputChange('period', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Billing Note</label>
                <input
                  type="text"
                  value={formData.billingNote || ''}
                  onChange={(e) => handleInputChange('billingNote', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => handleInputChange('isPopular', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded-full border-2 border-gray-600 peer-checked:border-indigo-500 peer-checked:bg-indigo-500 transition-all flex items-center justify-center">
                    {formData.isPopular && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-300">Mark as Popular Plan</span>
              </label>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Features</label>
                  <button onClick={addFeature} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Feature
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                  {formData?.features.map((feature, idx) => (
                    <div key={idx} className="flex gap-3 items-center p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                      <label className="relative cursor-pointer">
                        <input
                          type="checkbox"
                          checked={feature.included}
                          onChange={(e) => updateFeature(idx, 'included', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 rounded border-2 border-gray-600 peer-checked:border-indigo-500 peer-checked:bg-indigo-500 transition-all flex items-center justify-center">
                          {feature.included && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </label>
                      <input
                        type="text"
                        value={feature.text}
                        onChange={(e) => updateFeature(idx, 'text', e.target.value)}
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-700 bg-gray-800/50 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                      <button onClick={() => removeFeature(idx)} className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-900/20 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 sticky bottom-0 rounded-b-2xl">
              <button
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPricing;
