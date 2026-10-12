import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Plus, X, Wrench, Download, Search, AlertCircle } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [installations, setInstallations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    installationId: '',
    dateReported: new Date().toISOString().slice(0, 10),
    problemCategory: 'Inverter Fault',
    description: '',
    priority: 'Medium',
    scheduledVisitDate: '',
    status: 'Open',
    workPerformed: '',
    partsReplaced: '',
    completionNotes: '',
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiFetch('/api/services').then(res => res.ok ? res.json() : []),
      apiFetch('/api/installations').then(res => res.ok ? res.json() : []),
    ])
      .then(([srvData, instData]) => {
        setServices(Array.isArray(srvData) ? srvData : []);
        const validInst = Array.isArray(instData) ? instData : [];
        setInstallations(validInst);
        if (validInst.length > 0 && !formData.installationId) {
          setFormData(prev => ({ ...prev, installationId: validInst[0].id }));
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
    if (!formData.installationId) {
      alert('Please select an installation first.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/services', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          installationId: installations[0]?.id || '',
          dateReported: new Date().toISOString().slice(0, 10),
          problemCategory: 'Inverter Fault',
          description: '',
          priority: 'Medium',
          scheduledVisitDate: '',
          status: 'Open',
          workPerformed: '',
          partsReplaced: '',
          completionNotes: '',
        });
        fetchData();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    'Inverter Fault',
    'Panel Soiling / Cleaning',
    'Wiring & MC4 Connection',
    'Grounding & Surges',
    'Battery Disconnect',
    'Monitoring Gateway Offline',
    'Preventive Maintenance Visit',
    'Other Issue',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Service Requests & Maintenance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch records, scheduled technician visits, and resolution notes
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          Schedule Service
        </button>
      </div>

      <div className="bg-white border border-slate-200/90 shadow-2xs rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/75">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Service ID</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reported Date</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Project ID</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">Loading service logs...</td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">
                    No service requests logged yet. Click "Schedule Service" to create one.
                  </td>
                </tr>
              ) : (
                services.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-900 font-mono">{s.id}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600 tabular-nums">{s.dateReported}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-900 font-medium">
                      {s.problemCategory}
                      <span className="block text-[11px] text-slate-400 font-normal truncate max-w-xs">{s.description}</span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600 font-mono">{s.installationId}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        s.priority === 'Critical'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : s.priority === 'High'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {s.priority}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        s.status === 'Resolved' || s.status === 'Closed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Schedule Service Request</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700">Solar PV Project *</label>
                <select
                  required
                  value={formData.installationId}
                  onChange={e => setFormData({ ...formData, installationId: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  {installations.map(i => (
                    <option key={i.id} value={i.id}>{i.projectName} ({i.id})</option>
                  ))}
                  {installations.length === 0 && (
                    <option value="">No installations found — create a project first</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Problem Category *</label>
                  <select
                    value={formData.problemCategory}
                    onChange={e => setFormData({ ...formData, problemCategory: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Problem Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe failure symptoms, error codes on display, or client observation"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Date Reported</label>
                  <input
                    type="date"
                    required
                    value={formData.dateReported}
                    onChange={e => setFormData({ ...formData, dateReported: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Scheduled Visit Date</label>
                  <input
                    type="date"
                    value={formData.scheduledVisitDate}
                    onChange={e => setFormData({ ...formData, scheduledVisitDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
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
                  disabled={submitting || installations.length === 0}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
