import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DebugPricing = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  const runTest = async () => {
    setLogs([]);
    setStatus('running');
    addLog('Starting Connectivity Test...');

    try {

      // 1. Check LocalStorage & Auth Session
      addLog('Checking Auth Session...');
      
      const storedToken = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (storedToken) {
          addLog('Found custom "supabase.auth.token" in storage.');
      } else {
          addLog('❌ No "supabase.auth.token" found in storage.');
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (session) {
        addLog(`✅ Authenticated as: ${session.user.email} (${session.user.id})`);
        addLog(`Role: ${session.user.role}`);
      } else {
        addLog('⚠️ User is NOT logged in (Supabase SDK). My fix in lib/supabase.ts might not have run yet.');
      }

      // 2. Check Connection to 'pricing_plans' (Exact usePricing Query)
      addLog('Running "usePricing" exact query...');
      const start = Date.now();
      const { data: portPlans, error: portError } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('price', { ascending: true });

      const duration = Date.now() - start;
      if (portError) {
        addLog(`❌ usePricing Query FAILED (${duration}ms): ${portError.message}`);
      } else {
        addLog(`✅ usePricing Query SUCCESS (${duration}ms). Found ${portPlans?.length} rows.`);
      }

      // 3. Check Write Permissions
      if (session) {
        addLog('Attempting Empty Update (to Permission Check)...');
        const { error: updateError } = await supabase
          .from('pricing_plans')
          .update({ description: 'Test Update' })
          .eq('id', 'non_existent_id'); // Should fail row count but pass permission

        if (updateError) {
             addLog(`❌ WRITE FAILED: ${updateError.message} (Code: ${updateError.code})`);
        } else {
             addLog('✅ WRITE Permission seems OK.');
        }
      } else {
          addLog('⏭️ Skipping Write Test (Not Authenticated)');
      }

    } catch (err: any) {
      addLog(`🔥 CRITICAL ERROR: ${err.message}`);
    } finally {
      setStatus('done');
      addLog('Test Complete.');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Pricing Connectivity Debugger</h1>
      <p className="mb-6 text-gray-600">
        This tool verifies if your browser can connect to the Supabase database and access the pricing_plans table.
      </p>

      <button
        onClick={runTest}
        disabled={status === 'running'}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {status === 'running' ? 'Running Tests...' : 'Run Connectivity Test'}
      </button>

      <div className="mt-8 p-4 bg-black text-green-400 font-mono text-sm rounded-lg h-96 overflow-y-auto whitespace-pre-wrap">
        {logs.length === 0 ? '// Logs will appear here...' : logs.join('\n')}
      </div>
    </div>
  );
};

export default DebugPricing;
