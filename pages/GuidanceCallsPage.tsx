import React, { useState } from 'react';
import { Phone, Clock, Plus, Minus, Lock, ChevronRight, FileText, MoreVertical } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useGuidanceCalls } from '../hooks/useGuidanceCalls';
import DatePicker from '../components/DatePicker';
import NotesModal from '../components/NotesModal';
import CallDetailsModal from '../components/CallDetailsModal';

const GuidanceCallsPage = () => {
  const { user } = useUser();
  const { calls: myCalls, loading: callsLoading, createCall, updateCall } = useGuidanceCalls();

  if (user?.plan === 'free') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Guidance Calls</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Schedule 1-on-1 mentorship sessions with expert mentors.</p>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-12 text-center relative overflow-hidden group">
          <a href="/dashboard/settings" className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm transition-all hover:bg-white/50 dark:hover:bg-black/50">
            <div className="p-4 bg-indigo-600 rounded-full shadow-lg mb-4 transform group-hover:scale-110 transition-transform">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Premium Feature Locked</h3>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Upgrade to Pro to book 1-on-1 guidance calls</p>
          </a>
          <div className="blur-sm opacity-50 pointer-events-none select-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 border border-gray-200 dark:border-gray-800 rounded-xl">
                <div className="w-1/3 h-6 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="w-24 h-8 bg-green-100 dark:bg-green-900/30 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between p-6 border border-gray-200 dark:border-gray-800 rounded-xl">
                <div className="w-1/2 h-6 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="w-24 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Call State
  const [callDetails, setCallDetails] = useState({
    topic: '',
    description: '',
    date: '',
    timeSlot: ''
  });
  const [callStatus, setCallStatus] = useState<'idle' | 'submitting' | 'requested'>('idle');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeNoteCallId, setActiveNoteCallId] = useState<string | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);

  const timeSlots = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
  ];

  const handleSubmitCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setCallStatus('submitting');
    
    const { success, error } = await createCall({
      topic: callDetails.topic,
      description: callDetails.description,
      requested_date: callDetails.date,
      requested_time: callDetails.timeSlot,
      notes: ''
    });

    if (success) {
      setCallStatus('requested');
      setCallDetails({ topic: '', description: '', date: '', timeSlot: '' });
    } else {
      setCallStatus('idle');
      alert(error || 'Failed to submit request');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Guidance Calls</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Schedule 1-on-1 mentorship sessions with expert mentors.</p>
      </div>

      {!showBookingForm && callStatus !== 'requested' ? (
        // List View for All Users
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Scheduled Calls</h3>
            <button 
              onClick={() => setShowBookingForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Book New Call
            </button>
          </div>

          <div className="grid gap-4">
            {callsLoading ? (
               <div className="text-center py-10 text-gray-500">Loading calls...</div>
            ) : myCalls.length === 0 ? (
               <div className="text-center py-10 text-gray-500 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">No guidance calls scheduled yet.</div>
            ) : myCalls.map((call) => (
              <div key={call.id} className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${call.status === 'Scheduled' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'}`}>
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{call.topic}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {call.requested_date} • {call.requested_time}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveNoteCallId(call.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-800"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {call.notes ? 'View Notes' : 'Add Notes'}
                  </button>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    call.status === 'Scheduled' 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                  }`}>
                    {call.status}
                  </span>
                  <button
                    onClick={() => setSelectedCallId(call.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="View Options"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : callStatus === 'requested' ? (
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-12 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Submitted</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
            We have received your request for a guidance call. Our team will review your preferred slot and confirm the time shortly via email.
          </p>
          <button 
            onClick={() => {
              setCallStatus('idle');
              setShowBookingForm(false);
            }}
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            Back to My Calls
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule a Guidance Call</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Book a 1-hour session with an expert mentor.</p>
            </div>
            <button 
              onClick={() => setShowBookingForm(false)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmitCall} className="p-6 sm:p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Topic *</label>
                <input 
                  type="text" 
                  required
                  value={callDetails.topic}
                  onChange={(e) => setCallDetails({...callDetails, topic: e.target.value})}
                  placeholder="e.g. Essay Writing Strategy" 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Date *</label>
                <DatePicker
                  value={callDetails.date}
                  onChange={(date) => setCallDetails({ ...callDetails, date })}
                  placeholder="Select Date"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
              <textarea 
                rows={3}
                required
                value={callDetails.description}
                onChange={(e) => setCallDetails({...callDetails, description: e.target.value})}
                placeholder="Briefly describe what you'd like to discuss..." 
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Time Slot (1 Hour) *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setCallDetails({...callDetails, timeSlot: slot})}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                      callDetails.timeSlot === slot
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={callStatus === 'submitting' || !callDetails.date || !callDetails.timeSlot}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {callStatus === 'submitting' ? 'Submitting...' : 'Request Call'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes Modal */}
      <NotesModal
        isOpen={activeNoteCallId !== null}
        onClose={() => setActiveNoteCallId(null)}
        initialNotes={myCalls.find(c => c.id === activeNoteCallId)?.notes || ''}
        onSave={async (newNotes) => {
          if (activeNoteCallId) {
            await updateCall(activeNoteCallId, { notes: newNotes });
          }
        }}
        title={`Notes: ${myCalls.find(c => c.id === activeNoteCallId)?.topic || 'Call'}`}
      />
      
      {/* Call Details Modal */}
      <CallDetailsModal
        isOpen={selectedCallId !== null}
        onClose={() => setSelectedCallId(null)}
        call={myCalls.find(c => c.id === selectedCallId) || null}
        onCancelCall={async (id) => {
          const { success, error } = await updateCall(id, { status: 'Cancelled' });
          if (!success) alert(error);
        }}
      />
    </div>
  );
};

export default GuidanceCallsPage;
