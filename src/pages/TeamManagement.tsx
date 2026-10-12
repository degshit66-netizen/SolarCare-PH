import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { ShieldCheck, UserCheck, Wrench, Warehouse, BarChart3, Plus, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function TeamManagement() {
  const { user } = useAuth();
  const [team, setTeam] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Field Installer',
    phone: '',
    status: 'Active',
  });

  useEffect(() => {
    const stored = localStorage.getItem('solarcare_team_members');
    if (stored) {
      try { setTeam(JSON.parse(stored)); } catch { setTeam([]); }
    } else {
      setTeam([
        { id: 'TM-1', name: 'Engr. Juan Santos', email: 'juan@solarcare.ph', role: 'Project Manager', phone: '+639171234567', status: 'Active' },
        { id: 'TM-2', name: 'Pedro Reyes', email: 'pedro@solarcare.ph', role: 'Field Installer', phone: '+639189876543', status: 'Active' },
        { id: 'TM-3', name: 'Maria Cruz', email: 'maria@solarcare.ph', role: 'Warehouse Custodian', phone: '+639195554321', status: 'Active' },
      ]);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const newMember = {
      id: `TM-${Math.floor(1000 + Math.random() * 9000)}`,
      ...formData,
    };
    const updated = [newMember, ...team];
    setTeam(updated);
    localStorage.setItem('solarcare_team_members', JSON.stringify(updated));
    setIsModalOpen(false);
    setSubmitting(false);
    setFormData({ name: '', email: '', role: 'Field Installer', phone: '', status: 'Active' });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Project Manager': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Warehouse Custodian': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Field Installer': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Sales Agent': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Role-Based Access Control (RBAC)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage field electricians, warehouse custodians, sales agents, and project managers
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          Add Team Member
        </button>
      </div>

      {/* RBAC Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-2 text-emerald-700">
            <Wrench className="w-4 h-4" />
            <span className="text-xs font-bold">Field Installers</span>
          </div>
          <p className="text-[11px] text-slate-500">Can update installation milestones, upload site photos, and check off checklists.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-2 text-amber-700">
            <Warehouse className="w-4 h-4" />
            <span className="text-xs font-bold">Warehouse Custodian</span>
          </div>
          <p className="text-[11px] text-slate-500">Can encode serial numbers, scan equipment barcodes, and manage warehouse stock.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-2 text-purple-700">
            <UserCheck className="w-4 h-4" />
            <span className="text-xs font-bold">Project Managers</span>
          </div>
          <p className="text-[11px] text-slate-500">Full operational control over client accounts, service tickets, and Net Metering.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-2 text-blue-700">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-bold">Management & Finance</span>
          </div>
          <p className="text-[11px] text-slate-500">Access to audit logs, financial reports, warranty registers, and CSV data exports.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 shadow-2xs rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/75">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Member Name</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Assigned Role</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {team.map((m: any) => (
                <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-900">{m.name}</td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600">{m.email}</td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-xs">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getRoleBadge(m.role)}`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600 font-mono">{m.phone}</td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-xs">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Team Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engr. Mark Ramos"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="mark@solarcare.ph"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Role & Permissions *</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="Project Manager">Project Manager</option>
                  <option value="Field Installer">Field Installer</option>
                  <option value="Warehouse Custodian">Warehouse Custodian</option>
                  <option value="Sales Agent">Sales Agent</option>
                  <option value="Management & Finance">Management & Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Phone Number</label>
                <input
                  type="text"
                  placeholder="+63917..."
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
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
                  disabled={submitting}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
