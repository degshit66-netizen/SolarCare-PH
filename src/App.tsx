import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Customers from './pages/Customers';
import Installations from './pages/Installations';
import Equipment from './pages/Equipment';
import Warranties from './pages/Warranties';
import SettingsBackup from './pages/SettingsBackup';
import Claims from './pages/Claims';
import Services from './pages/Services';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import SolarCalculator from './pages/SolarCalculator';
import NetMetering from './pages/NetMetering';
import TeamManagement from './pages/TeamManagement';
import WarehouseScanner from './pages/WarehouseScanner';
import ClientNotifications from './pages/ClientNotifications';

const ProtectedRoute = ({ children, requireAdmin }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/" />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/installations" element={<Installations />} />
        <Route path="/calculator" element={<SolarCalculator />} />
        <Route path="/net-metering" element={<NetMetering />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/scanner" element={<WarehouseScanner />} />
        <Route path="/warranties" element={<Warranties />} />
        <Route path="/claims" element={<Claims />} />
        <Route path="/services" element={<Services />} />
        <Route path="/team" element={<TeamManagement />} />
        <Route path="/notifications" element={<ClientNotifications />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<ProtectedRoute requireAdmin><SettingsBackup /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
