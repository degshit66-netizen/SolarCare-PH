import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { QrCode, Camera, CheckCircle2, Plus, X, Search, Wrench } from 'lucide-react';

export default function WarehouseScanner() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [installations, setInstallations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [serialInput, setSerialInput] = useState('');
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('manual');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    installationId: '',
    category: 'Inverters',
    brand: 'Huawei',
    model: 'SUN2000-5KTL-M1',
    serialNumber: '',
    supplier: 'Solar Depot PH',
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiFetch('/api/equipment').then(res => res.ok ? res.json() : []),
      apiFetch('/api/installations').then(res => res.ok ? res.json() : []),
    ])
      .then(([eqData, instData]) => {
        setEquipment(Array.isArray(eqData) ? eqData : []);
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

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialInput.trim()) return;

    try {
      const res = await apiFetch('/api/equipment', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          serialNumber: serialInput.trim(),
          quantity: 1,
          status: 'In Warehouse / Scanned',
        }),
      });

      if (res.ok) {
        setSuccessMsg(`Successfully encoded serial: ${serialInput.trim()}`);
        setSerialInput('');
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert('Failed to register scanned serial');
      }
    } catch {
      alert('Network error while scanning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">QR / Barcode Serial Scanner</h1>
          <p className="text-xs text-slate-500 mt-1">
            Encode container van shipments, inverter serials, and solar panel barcodes into inventory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScanMode('manual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${scanMode === 'manual' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-300 text-slate-700'}`}
          >
            Manual / Gun Scanner
          </button>
          <button
            onClick={() => setScanMode('camera')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${scanMode === 'camera' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-300 text-slate-700'}`}
          >
            Camera Scanner
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scanner Form */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-600" />
            Scan / Input Equipment Serial
          </h2>

          {scanMode === 'camera' ? (
            <div className="bg-slate-950 rounded-xl p-6 text-center text-white space-y-3">
              <Camera className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
              <p className="text-xs font-medium">Camera viewfinder active (Point at inverter or panel barcode)</p>
              <button
                type="button"
                onClick={() => { setSerialInput(`BAR-${Math.floor(100000 + Math.random() * 900000)}`); setScanMode('manual'); }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Simulate Camera Scan
              </button>
            </div>
          ) : (
            <form onSubmit={handleScanSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Scan Barcode / Enter Serial Number *</label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    required
                    placeholder="e.g. SN-HUAWEI-2026-99182"
                    value={serialInput}
                    onChange={e => setSerialInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                  <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Associate with Project / Installation</label>
                <select
                  value={formData.installationId}
                  onChange={e => setFormData({ ...formData, installationId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  {installations.map(i => (
                    <option key={i.id} value={i.id}>{i.projectName} ({i.id})</option>
                  ))}
                  {installations.length === 0 && (
                    <option value="">No installations available</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Inverters">Inverters</option>
                    <option value="Solar panels">Solar panels</option>
                    <option value="Batteries">Batteries</option>
                    <option value="Mounting">Mounting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Encode & Save Serial
              </button>
            </form>
          )}
        </div>

        {/* Recently Scanned List */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Recently Scanned Hardware</span>
            <span className="text-xs font-normal text-slate-400">{equipment.length} items recorded</span>
          </h2>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase text-[10px]">Serial Number</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase text-[10px]">Brand / Model</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase text-[10px]">Category</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipment.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">No scanned serial numbers yet.</td>
                  </tr>
                ) : (
                  equipment.map((e: any) => (
                    <tr key={e.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 font-mono font-semibold text-slate-900">{e.serialNumber || 'N/A'}</td>
                      <td className="px-4 py-2.5 text-slate-700">{e.brand} {e.model}</td>
                      <td className="px-4 py-2.5 text-slate-600">{e.category}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
      </div>
    </div>
  );
}
