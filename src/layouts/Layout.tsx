import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Sun, Users, LayoutDashboard, Wrench, FileText, LogOut, ShieldCheck,
  Menu, X, Search, Bell, Settings, BarChart3, ChevronRight, Layers,
  CheckCircle2, AlertTriangle, ShieldAlert, Calculator, Scan
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { PWAInstallButton } from '../components/PWAInstallButton';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  // Fetch notifications (alerts for warranty expirations / open services)
  useEffect(() => {
    if (!user) return;
    apiFetch('/api/stats')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        const alerts = [];
        if (data.pendingServices > 0) {
          alerts.push({
            id: 'serv-1',
            type: 'service',
            title: `${data.pendingServices} Open Service Request${data.pendingServices > 1 ? 's' : ''}`,
            desc: 'Scheduled visits or repairs pending completion',
            link: '/services',
          });
        }
        if (data.openClaims > 0) {
          alerts.push({
            id: 'claim-1',
            type: 'claim',
            title: `${data.openClaims} Active Warranty Claim${data.openClaims > 1 ? 's' : ''}`,
            desc: 'Claims awaiting manufacturer resolution',
            link: '/claims',
          });
        }
        if (data.activeWarranties > 0) {
          alerts.push({
            id: 'war-1',
            type: 'warranty',
            title: `${data.activeWarranties} Active Hardware Warranties`,
            desc: 'System monitoring warranty coverage',
            link: '/warranties',
          });
        }
        setNotifications(alerts);
      })
      .catch(() => {});
  }, [user, location.pathname]);

  // Handle live global search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(() => {
      apiFetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          setSearchResults(data);
          setIsSearching(false);
        })
        .catch(() => {
          setIsSearching(false);
        });
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Installations', path: '/installations', icon: Layers },
    { label: 'Solar PV Calculator', path: '/calculator', icon: Calculator },
    { label: 'Net Metering & Permits', path: '/net-metering', icon: FileText },
    { label: 'Equipment Registry', path: '/equipment', icon: Wrench },
    { label: 'Warehouse Barcode Scanner', path: '/scanner', icon: Scan },
    { label: 'Warranties', path: '/warranties', icon: ShieldCheck },
    { label: 'Claims', path: '/claims', icon: ShieldAlert },
    { label: 'Service History', path: '/services', icon: Wrench },
    { label: 'Team & RBAC', path: '/team', icon: Users },
    { label: 'SMS & Viber Alerts', path: '/notifications', icon: Bell },
    { label: 'Documents & Photos', path: '/documents', icon: FileText },
    { label: 'Reports & Export', path: '/reports', icon: BarChart3 },
  ];

  if (!user) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-[#0B1528] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight">SolarCare PH</h1>
            <p className="text-[10px] text-teal-400 font-medium">Ops & Warranty</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearchModal(true)}
            className="p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle navigation"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Backdrop for Mobile Sidebar Drawer */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Desktop & Mobile Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0B1528] text-white flex flex-col shrink-0 z-40 transition-transform duration-200 ease-in-out border-r border-slate-800/80 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Lockup */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block">SolarCare PH</span>
            <span className="text-[11px] text-teal-400 font-medium">Solar Ops & Warranties</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Main Management
          </div>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          {user.role === 'admin' && (
            <>
              <div className="px-3 pt-4 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                System Administration
              </div>
              <Link
                to="/settings"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname === '/settings'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Settings className={`w-4 h-4 shrink-0 ${location.pathname === '/settings' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="truncate">Settings & Backup</span>
              </Link>
            </>
          )}
        </nav>

        {/* User Card & PWA Install in Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-[#091120]">
          <div className="mb-3">
            <PWAInstallButton />
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <div className="min-w-0 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-600/30 text-emerald-300 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="truncate">
                <p className="font-semibold text-xs text-white truncate">{user.name}</p>
                <span className="text-[10px] text-teal-400 font-medium capitalize block">{user.role}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area with Top Bar */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Desktop Top Navigation Bar */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-20 shadow-2xs">
          {/* Global Search Input */}
          <div className="w-96 relative">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search customers, projects, serial numbers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchModal(true)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Right Zone: Notifications & Account Badge */}
          <div className="flex items-center gap-4">
            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">System Notifications</span>
                    <span className="text-[10px] text-slate-400">{notifications.length} alerts</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto mt-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No pending alerts</p>
                    ) : (
                      notifications.map(n => (
                        <Link
                          key={n.id}
                          to={n.link}
                          onClick={() => setShowNotifications(false)}
                          className="py-2.5 px-1 block hover:bg-slate-50 rounded transition-colors"
                        >
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Status Tag */}
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-800 block">{user.name}</span>
              <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
            </div>
          </div>
        </header>

        {/* Global Search Results Overlay Modal */}
        {showSearchModal && searchQuery.trim().length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-20 px-4" onClick={() => setShowSearchModal(false)}>
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-4 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  autoFocus
                  type="text"
                  placeholder="Search across customers, installations, serial numbers..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 text-sm outline-none text-slate-900 placeholder-slate-400"
                />
                <button onClick={() => { setSearchQuery(''); setShowSearchModal(false); }} className="text-xs text-slate-400 hover:text-slate-600">
                  ESC
                </button>
              </div>

              <div className="py-2 max-h-96 overflow-y-auto space-y-4">
                {isSearching ? (
                  <p className="text-xs text-slate-400 text-center py-6">Searching records...</p>
                ) : !searchResults || (
                  searchResults.customers?.length === 0 &&
                  searchResults.installations?.length === 0 &&
                  searchResults.equipment?.length === 0 &&
                  searchResults.warranties?.length === 0
                ) ? (
                  <p className="text-xs text-slate-400 text-center py-6">No matching records found for "{searchQuery}".</p>
                ) : (
                  <>
                    {searchResults.customers?.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">Customers</div>
                        {searchResults.customers.map((c: any) => (
                          <Link
                            key={c.id}
                            to="/customers"
                            onClick={() => setShowSearchModal(false)}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                          >
                            <div>
                              <span className="font-semibold text-slate-900">{c.name}</span>
                              <span className="text-slate-400 text-[11px] ml-2">ID: {c.id}</span>
                            </div>
                            <span className="text-slate-500 text-[11px]">{c.city}, {c.province}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.installations?.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">Installations</div>
                        {searchResults.installations.map((i: any) => (
                          <Link
                            key={i.id}
                            to="/installations"
                            onClick={() => setShowSearchModal(false)}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                          >
                            <div>
                              <span className="font-semibold text-slate-900">{i.projectName}</span>
                              <span className="text-slate-400 text-[11px] ml-2">{i.capacityKwp} kWp</span>
                            </div>
                            <span className="text-slate-500 text-[11px]">{i.status}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.equipment?.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">Equipment & Serial Numbers</div>
                        {searchResults.equipment.map((e: any) => (
                          <Link
                            key={e.id}
                            to="/equipment"
                            onClick={() => setShowSearchModal(false)}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                          >
                            <div>
                              <span className="font-semibold text-slate-900">{e.brand} {e.model}</span>
                              <span className="text-emerald-600 font-mono text-[11px] ml-2">SN: {e.serialNumber || 'N/A'}</span>
                            </div>
                            <span className="text-slate-500 text-[11px]">{e.category}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Page Body Viewport */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
