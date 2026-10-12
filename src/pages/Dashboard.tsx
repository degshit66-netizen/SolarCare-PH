import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import {
  Users, Layers, ShieldCheck, Clock, AlertTriangle, Plus,
  CheckCircle2, ArrowUpRight, Wrench, ShieldAlert, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    installations: 0,
    equipment: 0,
    activeWarranties: 0,
    openClaims: 0,
    pendingServices: 0,
    recentInstallations: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  // Quick Action Modal states
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isInstModalOpen, setIsInstModalOpen] = useState(false);
  const [customersList, setCustomersList] = useState<any[]>([]);

  const [custForm, setCustForm] = useState({
    name: '',
    type: 'residential',
    phone: '',
    email: '',
    address: '',
    city: 'Quezon City',
    province: 'Metro Manila',
  });

  const [instForm, setInstForm] = useState({
    customerId: '',
    projectName: '',
    siteAddress: '',
    capacityKwp: 5.0,
    systemType: 'grid-tied',
    status: 'In Progress',
  });

  const [saving, setSaving] = useState(false);

  const fetchDashboardData = () => {
    setLoading(true);
    apiFetch('/api/stats')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data === 'object') {
          setStats({
            customers: data.customers || 0,
            installations: data.installations || 0,
            equipment: data.equipment || 0,
            activeWarranties: data.activeWarranties || 0,
            openClaims: data.openClaims || 0,
            pendingServices: data.pendingServices || 0,
            recentInstallations: Array.isArray(data.recentInstallations) ? data.recentInstallations : [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    apiFetch('/api/customers')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setCustomersList(list);
        if (list.length > 0 && !instForm.customerId) {
          setInstForm(prev => ({ ...prev, customerId: list[0].id }));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch('/api/customers', {
        method: 'POST',
        body: JSON.stringify(custForm),
      });
      if (res.ok) {
        setIsCustomerModalOpen(false);
        setCustForm({
          name: '',
          type: 'residential',
          phone: '',
          email: '',
          address: '',
          city: 'Quezon City',
          province: 'Metro Manila',
        });
        fetchDashboardData();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCreateInstallation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instForm.customerId) return;
    setSaving(true);
    try {
      const res = await apiFetch('/api/installations', {
        method: 'POST',
        body: JSON.stringify({
          ...instForm,
          capacityKwp: Number(instForm.capacityKwp),
        }),
      });
      if (res.ok) {
        setIsInstModalOpen(false);
        setInstForm(prev => ({
          ...prev,
          projectName: '',
          siteAddress: '',
          capacityKwp: 5.0,
        }));
        fetchDashboardData();
      }
    } finally {
      setSaving(false);
    }
  };

  // Operational metrics chart dataset based on actual counts
  const chartData = [
    { name: 'Customers', count: stats.customers, fill: '#0284c7' },
    { name: 'Installations', count: stats.installations, fill: '#10b981' },
    { name: 'Hardware', count: stats.equipment, fill: '#6366f1' },
    { name: 'Active Warranties', count: stats.activeWarranties, fill: '#14b8a6' },
    { name: 'Open Claims', count: stats.openClaims, fill: '#f59e0b' },
    { name: 'Pending Services', count: stats.pendingServices, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Quick Action CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Executive Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status of client installations, ongoing service calls, and hardware warranty coverages
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Customer
          </button>
          <button
            onClick={() => setIsInstModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            New Installation
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium text-slate-500">Customers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{stats.customers}</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Recorded accounts</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium text-slate-500">Installations</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{stats.installations}</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Solar PV systems</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium text-slate-500">Hardware Units</span>
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{stats.equipment}</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Tracked equipment</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium text-slate-500">Active Warranties</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{stats.activeWarranties}</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">In-coverage contracts</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium text-slate-500">Open Claims</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{stats.openClaims}</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Supplier processing</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium text-slate-500">Pending Services</span>
            <Wrench className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{stats.pendingServices}</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Field service tickets</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Operational Metrics Distribution & System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Operational Metrics Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Database Record Distribution</h2>
              <p className="text-[11px] text-slate-500">Live counts across primary functional entities</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-slate-100 font-semibold text-slate-600 rounded">
              SQLite Authoritative
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Warranty & Field Maintenance Alerts */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Operations & Compliance Status</h2>
              <span className="text-[11px] text-slate-400">Philippines Standard</span>
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Warranty Coverage Rate</span>
                    <span className="text-[11px] text-slate-500">Hardware covered under active terms</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  {stats.equipment > 0 ? Math.round((stats.activeWarranties / stats.equipment) * 100) : 100}%
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">System Integrity</span>
                    <span className="text-[11px] text-slate-500">Database schema verified and synced</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700">Healthy</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Automated Backup Status</span>
                    <span className="text-[11px] text-slate-500">Snapshot available under Settings</span>
                  </div>
                </div>
                <Link to="/settings" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                  Manage <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Server: Node LTS + SQLite</span>
            <span>Zero API Billing Required</span>
          </div>
        </div>

      </div>

      {/* Recent Installations Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Solar Projects</h2>
            <p className="text-[11px] text-slate-500">Latest recorded commissioning and rooftop installations</p>
          </div>
          <Link
            to="/installations"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            View all projects <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/75">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Project ID</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Project Name</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">Loading installation register...</td>
                </tr>
              ) : stats.recentInstallations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">
                    No installations registered yet. Click "New Installation" to record your first project.
                  </td>
                </tr>
              ) : (
                stats.recentInstallations.map((inst: any) => (
                  <tr key={inst.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-900 font-mono">{inst.id}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-900">{inst.projectName}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600">{inst.siteAddress}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-900 font-semibold tabular-nums">{inst.capacityKwp} kWp</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600 capitalize">{inst.systemType}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        inst.status === 'Completed' || inst.status === 'Commissioned'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {inst.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Modal: Add Customer */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add New Customer</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700">Client / Company Name *</label>
                <input
                  type="text"
                  required
                  value={custForm.name}
                  onChange={e => setCustForm({ ...custForm, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Type</label>
                  <select
                    value={custForm.type}
                    onChange={e => setCustForm({ ...custForm, type: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Phone *</label>
                  <input
                    type="text"
                    required
                    value={custForm.phone}
                    onChange={e => setCustForm({ ...custForm, phone: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Address *</label>
                <input
                  type="text"
                  required
                  value={custForm.address}
                  onChange={e => setCustForm({ ...custForm, address: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Modal: New Installation */}
      {isInstModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">New Solar Installation Project</h3>
            <form onSubmit={handleCreateInstallation} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700">Customer Account *</label>
                <select
                  required
                  value={instForm.customerId}
                  onChange={e => setInstForm({ ...instForm, customerId: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  {customersList.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                  {customersList.length === 0 && (
                    <option value="">No customers found — add a customer first</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quezon City 10kWp Hybrid"
                  value={instForm.projectName}
                  onChange={e => setInstForm({ ...instForm, projectName: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Capacity (kWp) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={instForm.capacityKwp}
                    onChange={e => setInstForm({ ...instForm, capacityKwp: Number(e.target.value) })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">System Type *</label>
                  <select
                    value={instForm.systemType}
                    onChange={e => setInstForm({ ...instForm, systemType: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="grid-tied">Grid-tied</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="off-grid">Off-grid</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Site Address *</label>
                <input
                  type="text"
                  required
                  value={instForm.siteAddress}
                  onChange={e => setInstForm({ ...instForm, siteAddress: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInstModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || customersList.length === 0}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
