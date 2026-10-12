import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Bell, Send, CheckCircle2, MessageSquare, Smartphone, Zap } from 'lucide-react';

export default function ClientNotifications() {
  const [logs, setLogs] = useState<any[]>([]);
  const [phone, setPhone] = useState('+639171234567');
  const [message, setMessage] = useState('Magandang araw! Ang inyong Solar Installation Team ay paalis na patungo sa inyong site para sa scheduled PV commissioning.');
  const [channel, setChannel] = useState<'SMS' | 'Viber' | 'WhatsApp'>('SMS');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('solarcare_sms_logs');
    if (stored) {
      try { setLogs(JSON.parse(stored)); } catch { setLogs([]); }
    } else {
      setLogs([
        { id: 'MSG-101', channel: 'SMS', phone: '+639171234567', message: 'Site survey approved for Quezon City 5kWp Hybrid Project.', time: '2026-10-10 14:30', status: 'Sent' },
        { id: 'MSG-102', channel: 'Viber', phone: '+639189876543', message: 'Installation team is en route to site location.', time: '2026-10-11 08:00', status: 'Delivered' },
      ]);
    }
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !message) return;
    setSending(true);

    // Deep link logic based on selected channel
    let url = '';
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = phone.replace(/\s+/g, '');

    if (channel === 'SMS') {
      url = `sms:${cleanPhone}?body=${encodedMessage}`;
    } else if (channel === 'Viber') {
      // More compatible Viber chat link
      url = `viber://chat?number=${cleanPhone}`;
    } else if (channel === 'WhatsApp') {
      url = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodedMessage}`;
    }

    // Attempt to open the link
    if (url) {
      window.open(url, '_blank');
    }

    // Log the action locally
    const newLog = {
      id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
      channel,
      phone,
      message,
      time: new Date().toLocaleString(),
      status: 'Redirected to App',
    };
    const updated = [newLog, ...logs];
    setLogs(updated);
    localStorage.setItem('solarcare_sms_logs', JSON.stringify(updated));
    setSending(false);
    setSuccess(`Redirecting to ${channel} for manual send...`);
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleQuickTemplate = (type: string) => {
    if (type === 'survey') {
      setMessage('Magandang araw! Ang inyong Net Metering & Site Survey ay opisyal na naaprubahan na ng aming engineering team.');
    } else if (type === 'enroute') {
      setMessage('Magandang araw! Ang aming Solar Installation Team ay paalis na at patungo na sa inyong site para sa araw na ito.');
    } else if (type === 'turnover') {
      setMessage('Mabuhay! Ang inyong Solar PV System ay tapos na i-commission at i-turnover. Narito na ang inyong warranty certificates.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">SMS & Viber / WhatsApp Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time automated updates for clients during site surveys, team dispatch, and project turnover
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Composer Form */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            Send Client Update
          </h2>

          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Transmission Channel *</label>
              <div className="grid grid-cols-3 gap-2">
                {(['SMS', 'Viber', 'WhatsApp'] as const).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${channel === c ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Client Mobile Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">Message Content *</label>
                <div className="space-x-1">
                  <button type="button" onClick={() => handleQuickTemplate('survey')} className="text-[10px] text-blue-600 hover:underline">Survey</button>
                  <span className="text-slate-300">|</span>
                  <button type="button" onClick={() => handleQuickTemplate('enroute')} className="text-[10px] text-blue-600 hover:underline">En Route</button>
                  <span className="text-slate-300">|</span>
                  <button type="button" onClick={() => handleQuickTemplate('turnover')} className="text-[10px] text-blue-600 hover:underline">Turnover</button>
                </div>
              </div>
              <textarea
                required
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>{sending ? 'Transmitting...' : `Transmit via ${channel}`}</span>
            </button>
          </form>
        </div>

        {/* Transmission Log */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Transmission Log</span>
            <span className="text-xs font-normal text-slate-400">{logs.length} messages sent</span>
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.map((log: any) => (
              <div key={log.id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${log.channel === 'SMS' ? 'bg-blue-500' : log.channel === 'Viber' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                    {log.channel} to {log.phone}
                  </span>
                  <span className="text-[10px] text-slate-400 tabular-nums">{log.time}</span>
                </div>
                <p className="text-xs text-slate-600">{log.message}</p>
                <div className="flex justify-end">
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
