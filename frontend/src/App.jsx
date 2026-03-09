import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Members from './pages/Members';
import Messages from './pages/Messages';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="servers" element={<Overview />} />
              <Route path="members" element={<Members />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<div className="text-zinc-400">Page under construction.</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
