import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Plus, X, Wrench, Download, Search, AlertCircle } from 'lucide-react';

export default function Equipment() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [installations, setInstallations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serialWarning, setSerialWarning] = useState('');

  const [formData, setFormData] = useState({
    installationId: '',
    category: 'Solar panels',
    brand: '',
    model: '',
    serialNumber: '',
    quantity: 1,
    unit: 'pcs',
    specifications: '',
    supplier: '',
    status: 'Operational',
    notes: '',
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiFetch('/api/equipment').then(res => res.ok ? res.json() : []),
      apiFetch('/api/installations').then(res => res.ok ? res.json() : [])
    ])
      .then(([equipData, instData]) => {
        const validEquip = Array.isArray(equipData) ? equipData : [];
        const validInst = Array.isArray(instData) ? instData : [];
        setEquipment(validEquip);
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

  const handleSerialChange = (serial: string) => {
    setFormData({ ...formData, serialNumber: serial });
    if (serial.trim()) {
      const exists = equipment.some(e => e.serialNumber && e.serialNumber.toLowerCase() === serial.trim().toLowerCase());
      if (exists) {
        setSerialWarning(`Warning: Serial number "${serial}" already exists in inventory.`);
      } else {
        setSerialWarning('');
      }
    } else {
      setSerialWarning('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.installationId) {
      alert('Please select an installation first.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/equipment', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity),
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          installationId: installations[0]?.id || '',
          category: 'Solar panels',
          brand: '',
          model: '',
          serialNumber: '',
          quantity: 1,
          unit: 'pcs',
          specifications: '',
          supplier: '',
          status: 'Operational',
          notes: '',
        });
        setSerialWarning('');
        fetchData();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Installation ID', 'Category', 'Brand', 'Model', 'Serial Number', 'Quantity', 'Status'];
    const rows = filteredEquipment.map(e => [
      e.id, e.installationId, e.category, e.brand, e.model, e.serialNumber || 'N/A', e.quantity, e.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `equipment_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEquipment = equipment.filter(e => {
    const matchesSearch =
      (e.brand && e.brand.toLowerCase().includes(search.toLowerCase())) ||
      (e.model && e.model.toLowerCase().includes(search.toLowerCase())) ||
      (e.serialNumber && e.serialNumber.toLowerCase().includes(search.toLowerCase())) ||
      (e.id && e.id.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    'All',
    'Solar panels',
    'Inverters',
    'Batteries',
    'Charge controllers',
    'Mounting structures',
    'Cables and electrical components',
    'Monitoring devices',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Equipment Inventory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Hardware components, models, and serial number registry
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
            Add Equipment
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search brand, model, S/N..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Category:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-xs px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/90 shadow-2xs rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/75">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Component / Model</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Serial Number</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Project ID</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">Loading equipment inventory...</td>
                </tr>
              ) : filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">
                    No equipment found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredEquipment.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-900 font-mono">{e.id}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-900">
                      {e.brand} {e.model}
                      <span className="block text-[11px] text-slate-400 font-normal">Qty: {e.quantity} {e.unit}</span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600">{e.category}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-900 font-mono">
                      {e.serialNumber ? (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700">{e.serialNumber}</span>
                      ) : (
                        <span className="text-slate-400">Not serialized</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600 font-mono">{e.installationId}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        e.status === 'Operational' || e.status === 'Installed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Equipment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Equipment to Installation</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700">Associated Solar Installation *</label>
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
                  <label className="block text-xs font-medium text-slate-700">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Operational Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Installed">Installed</option>
                    <option value="Planned">Planned</option>
                    <option value="Under Inspection">Under Inspection</option>
                    <option value="Faulty">Faulty</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Brand / Manufacturer *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jinko, Deye, Huawei"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tiger Pro 550W"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Serial Number</label>
                <input
                  type="text"
                  placeholder="e.g. JK20261108291"
                  value={formData.serialNumber}
                  onChange={e => handleSerialChange(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
                {serialWarning && (
                  <p className="mt-1 text-[11px] text-amber-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {serialWarning}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
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
                  {submitting ? 'Registering...' : 'Register Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
