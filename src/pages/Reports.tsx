import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Printer, Download, BarChart3, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export default function Reports() {
  const [reportType, setReportType] = useState('customers');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReportData = (type: string) => {
    setLoading(true);
    let endpoint = '/api/customers';
    if (type === 'installations') endpoint = '/api/installations';
    else if (type === 'warranties') endpoint = '/api/warranties';
    else if (type === 'equipment') endpoint = '/api/equipment';

    apiFetch(endpoint)
      .then(res => res.ok ? res.json() : [])
      .then(resData => {
        setData(Array.isArray(resData) ? resData : []);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReportData(reportType);
  }, [reportType]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const keys = Object.keys(data[0]).filter(k => k !== 'uuid');
    const rows = data.map(item => keys.map(k => `"${(item[k] ?? '').toString().replace(/"/g, '""')}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [keys.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `solarcare_${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports & Audit Registers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate printable audit registries, client turnover summaries, and CSV data exports
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={data.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-2xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            Print Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 print:hidden space-x-2">
        <button
          onClick={() => setReportType('customers')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
            reportType === 'customers'
              ? 'border-emerald-500 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Customer Directory
        </button>
        <button
          onClick={() => setReportType('installations')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
            reportType === 'installations'
              ? 'border-emerald-500 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Installation Register
        </button>
        <button
          onClick={() => setReportType('equipment')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
            reportType === 'equipment'
              ? 'border-emerald-500 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Equipment Inventory
        </button>
        <button
          onClick={() => setReportType('warranties')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
            reportType === 'warranties'
              ? 'border-emerald-500 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Warranty Register
        </button>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block pb-4 mb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold">SolarCare PH — {reportType.toUpperCase()} REGISTER</h2>
        <p className="text-xs text-slate-600">Generated on {new Date().toLocaleString()}</p>
      </div>

      {/* Table Content */}
      <div className="bg-white border border-slate-200/90 shadow-2xs rounded-xl overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading audit data...</div>
          ) : data.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No records found for this register.</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50/75 print:bg-slate-100">
                <tr>
                  {Object.keys(data[0])
                    .filter(k => k !== 'uuid')
                    .map(key => (
                      <th
                        key={key}
                        className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-[10px]"
                      >
                        {key.replace(/([A-Z])/g, ' $1')}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    {Object.keys(row)
                      .filter(k => k !== 'uuid')
                      .map(key => (
                        <td key={key} className="px-4 py-2.5 text-slate-800 whitespace-nowrap">
                          {row[key] !== null && row[key] !== undefined ? String(row[key]) : '-'}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
