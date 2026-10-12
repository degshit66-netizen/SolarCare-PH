import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { FileText, Plus, X, CheckCircle2, Clock, Printer } from 'lucide-react';

export default function NetMetering() {
  const [applications, setApplications] = useState<any[]>([]);
  const [installations, setInstallations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    installationId: '',
    distributionUtility: 'Meralco',
    accountNumber: '',
    serviceIdNumber: '',
    status: 'Application Filed',
    submissionDate: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiFetch('/api/warranties').then(res => res.ok ? res.json() : []), // Reusing warranty/installations endpoints
      apiFetch('/api/installations').then(res => res.ok ? res.json() : []),
    ])
      .then(([_, insts]) => {
        const validInsts = Array.isArray(insts) ? insts : [];
        setInstallations(validInsts);
        // Mock net metering applications derived from installations or local storage state
        const stored = localStorage.getItem('solarcare_net_metering');
        if (stored) {
          try { setApplications(JSON.parse(stored)); } catch { setApplications([]); }
        } else {
          setApplications([
            {
              id: 'NM-1001',
              installationId: validInsts[0]?.id || 'INST-8888',
              distributionUtility: 'Meralco',
              accountNumber: '0129384756',
              status: 'Site Inspection',
              submissionDate: '2026-10-01',
            }
          ]);
        }
        if (validInsts.length > 0 && !formData.installationId) {
          setFormData(prev => ({ ...prev, installationId: validInsts[0].id }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const newApp = {
      id: `NM-${Math.floor(1000 + Math.random() * 9000)}`,
      ...formData,
    };
    const updated = [newApp, ...applications];
    setApplications(updated);
    localStorage.setItem('solarcare_net_metering', JSON.stringify(updated));
    setIsModalOpen(false);
    setSubmitting(false);
  };

  const handlePrintForm = (app: any) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>Net Metering Application Form - ${app.id}</title></head>
        <body style="font-family: sans-serif; padding: 40px; color: #1e293b;">
          <h2 style="text-align: center; color: #0f172a;">ENERGY REGULATORY COMMISSION (ERC)</h2>
          <h3 style="text-align: center; color: #334155;">Application for Net-Metering Interconnection</h3>
          <hr style="margin: 20px 0;" />
          <p><strong>Application Reference:</strong> ${app.id}</p>
          <p><strong>Distribution Utility (DU):</strong> ${app.distributionUtility}</p>
          <p><strong>DU Account Number:</strong> ${app.accountNumber || 'N/A'}</p>
          <p><strong>Associated Installation ID:</strong> ${app.installationId}</p>
          <p><strong>Current Status:</strong> ${app.status}</p>
          <p><strong>Submission Date:</strong> ${app.submissionDate}</p>
          <br /><br />
          <table style="width: 100%; margin-top: 40px;">
            <tr>
              <td style="width: 50%; text-align: center;">
                <div style="border-top: 1px solid #94a3b8; width: 200px; margin: 0 auto; padding-top: 5px;">Customer Signature</div>
              </td>
              <td style="width: 50%; text-align: center;">
                <div style="border-top: 1px solid #94a3b8; width: 200px; margin: 0 auto; padding-top: 5px;">Solar Engineer Certification</div>
              </td>
            </tr>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Net Metering & Permitting</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track Meralco / DU interconnection permits and generate ERC application forms
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          New Net Metering Application
        </button>
      </div>

      <div className="bg-white border border-slate-200/90 shadow-2xs rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/75">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reference ID</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Distribution Utility</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Account Number</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Project ID</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">No Net Metering applications found.</td>
                </tr>
              ) : (
                applications.map((app: any) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-900 font-mono">{app.id}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-900">{app.distributionUtility}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600 font-mono">{app.accountNumber || 'N/A'}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600 font-mono">{app.installationId}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-right space-x-2">
                      <button
                        onClick={() => handlePrintForm(app)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded transition-colors inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" /> Form PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">New Net Metering Application</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700">Solar Project *</label>
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
                    <option value="">No installations found</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Distribution Utility (DU) *</label>
                <select
                  value={formData.distributionUtility}
                  onChange={e => setFormData({ ...formData, distributionUtility: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="Meralco">Meralco</option>
                  <option value="VECO">VECO (Visayan Electric)</option>
                  <option value="DLPC">Davao Light (DLPC)</option>
                  <option value="LEDC">Lupi Electric / Other DU</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">DU Account / SIN Number</label>
                <input
                  type="text"
                  placeholder="e.g. 0129384756"
                  value={formData.accountNumber}
                  onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Application Status *</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="Application Filed">Application Filed</option>
                  <option value="Site Inspection">Site Inspection</option>
                  <option value="Meter Testing">Meter Testing</option>
                  <option value="Final Approval">Final Approval</option>
                  <option value="Active Net Metering">Active Net Metering</option>
                </select>
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
                  {submitting ? 'Saving...' : 'Save Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
