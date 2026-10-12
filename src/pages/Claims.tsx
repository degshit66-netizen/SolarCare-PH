import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Plus, X, ShieldAlert, Download, Search } from 'lucide-react';

export default function Claims() {
  const [claims, setClaims] = useState<any[]>([]);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    warrantyId: '',
    dateReported: new Date().toISOString().slice(0, 10),
    problemDescription: '',
    providerReference: '',
    status: 'Submitted',
    resolutionNotes: '',
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiFetch('/api/claims').then(res => res.ok ? res.json() : []),
      apiFetch('/api/warranties').then(res => res.ok ? res.json() : []),
    ])
      .then(([claimsData, warData]) => {
        setClaims(Array.isArray(claimsData) ? claimsData : []);
        const validWars = Array.isArray(warData) ? warData : [];
        setWarranties(validWars);
        if (validWars.length > 0 && !formData.warrantyId) {
          setFormData(prev => ({ ...prev, warrantyId: validWars[0].id }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.warrantyId) {
      alert('Please select a warranty policy first.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/claims', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          warrantyId: warranties[0]?.id || '',
          dateReported: new Date().toISOString().slice(0, 10),
          problemDescription: '',
          providerReference: '',
          status: 'Submitted',
          resolutionNotes: '',
        });
        fetchData();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Warranty Claims</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track RMA tickets, component failure claims, and manufacturer warranty resolutions
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          File New Claim
        </button>
      </div>

      <div className="bg-white border border-slate-200/90 shadow-2xs rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/75">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Claim ID</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date Reported</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Warranty Ref</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Problem Summary</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Claim Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-slate-400">Loading claims ledger...</td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-slate-400">
                    No warranty claims recorded. Click "File New Claim" to log an issue.
                  </td>
                </tr>
              ) : (
                claims.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-900 font-mono">{c.id}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600 tabular-nums">{c.dateReported}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600 font-mono">{c.warrantyId}</td>
                    <td className="px-6 py-3.5 text-xs text-slate-900 max-w-sm truncate">{c.problemDescription}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        c.status === 'Approved' || c.status === 'Closed' || c.status === 'Replaced'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Claim Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">File Warranty Claim</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700">Covered Warranty Policy *</label>
                <select
                  required
                  value={formData.warrantyId}
                  onChange={e => setFormData({ ...formData, warrantyId: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  {warranties.map(w => (
                    <option key={w.id} value={w.id}>{w.provider} ({w.id}) - {w.type}</option>
                  ))}
                  {warranties.length === 0 && (
                    <option value="">No warranties found — register warranty first</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Date Reported *</label>
                <input
                  type="date"
                  required
                  value={formData.dateReported}
                  onChange={e => setFormData({ ...formData, dateReported: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Problem Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe hardware behavior, fault codes, or failure details"
                  value={formData.problemDescription}
                  onChange={e => setFormData({ ...formData, problemDescription: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Provider RMA / Ticket Reference</label>
                <input
                  type="text"
                  placeholder="e.g. RMA-99210-PH"
                  value={formData.providerReference}
                  onChange={e => setFormData({ ...formData, providerReference: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || warranties.length === 0}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
