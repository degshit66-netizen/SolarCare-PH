import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Plus, X, Upload, Download, Trash2, FileText, Image, FileCheck, Layers } from 'lucide-react';

export default function Documents() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [installations, setInstallations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [docType, setDocType] = useState('Installation Photo');
  const [installationId, setInstallationId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiFetch('/api/documents').then(res => res.ok ? res.json() : []),
      apiFetch('/api/installations').then(res => res.ok ? res.json() : []),
    ])
      .then(([docs, insts]) => {
        setDocuments(Array.isArray(docs) ? docs : []);
        const validInsts = Array.isArray(insts) ? insts : [];
        setInstallations(validInsts);
        if (validInsts.length > 0 && !installationId) {
          setInstallationId(validInsts[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('type', docType);
      if (installationId) formData.append('installationId', installationId);

      const res = await apiFetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setIsModalOpen(false);
        setSelectedFile(null);
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to upload document');
      }
    } catch {
      alert('Network error while uploading');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await apiFetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch {
      alert('Failed to delete document');
    }
  };

  const docTypes = [
    'Installation Photo',
    'Site Survey',
    'Quote/Invoice',
    'Equipment Manual',
    'Warranty Certificate',
    'Commissioning Report',
    'Handover Form',
    'Maintenance Document',
    'Claim Evidence',
    'Other',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Project Documents & Photos</h1>
          <p className="text-xs text-slate-500 mt-1">
            Site survey photos, commissioning certificates, and equipment user manuals
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg shadow-sm"
        >
          <Upload className="w-3.5 h-3.5 text-emerald-400" />
          Upload Document
        </button>
      </div>

      <div className="bg-white border border-slate-200/90 shadow-2xs rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/75">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">File Name</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Document Type</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Project ID</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Upload Date</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">Loading document vault...</td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">
                    No documents uploaded yet. Click "Upload Document" to attach project files.
                  </td>
                </tr>
              ) : (
                documents.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-900 flex items-center gap-2.5">
                      {doc.mimeType?.startsWith('image/') ? (
                        <Image className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                      <span>{doc.originalName}</span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600">{doc.type}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600 font-mono">{doc.installationId || 'General'}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-500 tabular-nums">
                      {(doc.sizeBytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-500 tabular-nums">
                      {doc.createdAt?.slice(0, 10)}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-right space-x-2">
                      <a
                        href={`/api/documents/download/${doc.id}`}
                        download
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded inline-block transition-colors"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded inline-block transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Upload Project File</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700">Document Type *</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  {docTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Associate with Installation</label>
                <select
                  value={installationId}
                  onChange={e => setInstallationId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="">General Project Document</option>
                  {installations.map(i => (
                    <option key={i.id} value={i.id}>{i.projectName} ({i.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Select File (Images, PDF) *</label>
                <input
                  type="file"
                  required
                  accept="image/*,application/pdf"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
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
                  disabled={uploading}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
