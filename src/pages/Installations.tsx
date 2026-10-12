import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Plus, X } from 'lucide-react';

export default function Installations() {
  const [installations, setInstallations] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    projectName: '',
    siteAddress: '',
    capacityKwp: 5.0,
    systemType: 'grid-tied',
    status: 'Draft',
    notes: '',
  });

  const fetchData = () => {
    setLoading(true);
    setError('');
    
    Promise.all([
      apiFetch('/api/installations').then(res => res.ok ? res.json() : []),
      apiFetch('/api/customers').then(res => res.ok ? res.json() : [])
    ])
      .then(([instData, custData]) => {
        setInstallations(Array.isArray(instData) ? instData : []);
        const validCustomers = Array.isArray(custData) ? custData : [];
        setCustomers(validCustomers);
        if (validCustomers.length > 0 && !formData.customerId) {
          setFormData(prev => ({ ...prev, customerId: validCustomers[0].id }));
        }
      })
      .catch(err => {
        setError(err.message || 'Could not load installations');
        setInstallations([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) {
      alert('Please select or create a customer first.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/installations', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          capacityKwp: Number(formData.capacityKwp),
        }),
      });
      if (res.ok) {
        const createdInst = await res.json();
        setIsModalOpen(false);
        setInstallations(prev => [createdInst, ...prev]);
        setFormData({
          customerId: customers[0]?.id || '',
          projectName: '',
          siteAddress: '',
          capacityKwp: 5.0,
          systemType: 'grid-tied',
          status: 'Draft',
          notes: '',
        });
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to create installation');
      }
    } catch {
      alert('Network error while saving installation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Installations</h1>
          <p className="text-xs text-slate-500 mt-1">Solar PV project records and commissioning states</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Installation
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">Loading installations...</td>
                </tr>
              ) : installations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">No installations found. Click "New Installation" to create one.</td>
                </tr>
              ) : (
                installations.map((i: any) => (
                  <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{i.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                      {i.projectName}
                      <span className="block text-xs text-slate-500 font-normal">{i.siteAddress}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 tabular-nums">{i.capacityKwp} kWp</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 capitalize">{i.systemType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        i.status === 'Completed' || i.status === 'Commissioned' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {i.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Installation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900">New Solar Installation</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700">Customer *</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                  {customers.length === 0 && (
                    <option value="">No customers available - create one first</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dela Cruz Residence 5kWp Hybrid"
                  value={formData.projectName}
                  onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Site Address *</label>
                <input
                  type="text"
                  required
                  value={formData.siteAddress}
                  onChange={e => setFormData({ ...formData, siteAddress: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">System Capacity (kWp) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.capacityKwp}
                    onChange={e => setFormData({ ...formData, capacityKwp: Number(e.target.value) })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">System Type *</label>
                  <select
                    value={formData.systemType}
                    onChange={e => setFormData({ ...formData, systemType: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="grid-tied">Grid-tied</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="off-grid">Off-grid</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Commissioned">Commissioned</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || customers.length === 0}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Installation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
