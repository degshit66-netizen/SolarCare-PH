import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Plus, X, ShieldCheck, Download, Search, AlertCircle, Calendar } from 'lucide-react';

export default function Warranties() {
  const [warranties, setWarranties] = useState<any[]>([]);
  const [installations, setInstallations] = useState<any[]>([]);
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    installationId: '',
    equipmentId: '',
    provider: '',
    type: 'Manufacturer Product Warranty',
    referenceNumber: '',
    description: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    terms: 'Standard manufacturer coverage',
    status: 'Active',
    notes: '',
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiFetch('/api/warranties').then(res => res.ok ? res.json() : []),
      apiFetch('/api/installations').then(res => res.ok ? res.json() : []),
      apiFetch('/api/equipment').then(res => res.ok ? res.json() : []),
    ])
      .then(([warData, instData, equipData]) => {
        setWarranties(Array.isArray(warData) ? warData : []);
        const validInst = Array.isArray(instData) ? instData : [];
        setInstallations(validInst);
        setEquipmentList(Array.isArray(equipData) ? equipData : []);
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
      const res = await apiFetch('/api/warranties', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          installationId: installations[0]?.id || '',
          equipmentId: '',
          provider: '',
          type: 'Manufacturer Product Warranty',
          referenceNumber: '',
          description: '',
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          terms: 'Standard manufacturer coverage',
          status: 'Active',
          notes: '',
        });
        fetchData();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Installation ID', 'Provider', 'Warranty Type', 'Reference No', 'Start Date', 'End Date', 'Status'];
    const rows = filteredWarranties.map(w => [
      w.id, w.installationId, w.provider, w.type, w.referenceNumber || 'N/A', w.startDate, w.endDate, w.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `warranty_register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredWarranties = warranties.filter(w => {
    const matchesSearch =
      (w.provider && w.provider.toLowerCase().includes(search.toLowerCase())) ||
      (w.type && w.type.toLowerCase().includes(search.toLowerCase())) ||
      (w.id && w.id.toLowerCase().includes(search.toLowerCase())) ||
      (w.referenceNumber && w.referenceNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const warrantyTypes = [
    'Manufacturer Product Warranty',
    'Manufacturer Performance Warranty',
    'Workmanship or Installation Warranty',
    'Battery Warranty',
    'Inverter Warranty',
    'Other',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Warranty Monitoring</h1>
          <p className="text-xs text-slate-500 mt-1">
            Active manufacturer coverage periods, policy certificates, and expiration dates
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            Add Warranty
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search provider, type, certificate..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-xs px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
            <option value="Claim Pending">Claim Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/90 shadow-2xs rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/75">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Warranty ID</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Provider & Policy</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Coverage Type</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Project ID</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Validity Period</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">Loading warranties...</td>
                </tr>
              ) : filteredWarranties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">
                    No warranty records matching criteria.
                  </td>
                </tr>
              ) : (
                filteredWarranties.map((w: any) => (
                  <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-900 font-mono">{w.id}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-900">
                      {w.provider}
                      {w.referenceNumber && (
                        <span className="block text-[11px] text-slate-400 font-normal">Ref: {w.referenceNumber}</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600">{w.type}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600 font-mono">{w.installationId}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600 tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{w.startDate} to {w.endDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        w.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : w.status === 'Expiring Soon'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Warranty Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Register Hardware Warranty</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700">Solar Installation Project *</label>
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
                  <label className="block text-xs font-medium text-slate-700">Warranty Provider / Manufacturer *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Huawei Solar, Deye, Jinko"
                    value={formData.provider}
                    onChange={e => setFormData({ ...formData, provider: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Warranty Type *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {warrantyTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Policy / Certificate Ref Number</label>
                <input
                  type="text"
                  placeholder="e.g. WAR-2026-PH-991"
                  value={formData.referenceNumber}
                  onChange={e => setFormData({ ...formData, referenceNumber: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Coverage Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Coverage End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Terms & Coverage Summary</label>
                <textarea
                  rows={2}
                  value={formData.terms}
                  onChange={e => setFormData({ ...formData, terms: e.target.value })}
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
                  disabled={submitting || installations.length === 0}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Warranty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
