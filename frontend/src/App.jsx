import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardLayout from './layouts/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Members from './pages/Members';
import Messages from './pages/Messages';
import Embeds from './pages/Embeds';
import Settings from './pages/Settings';
import Channels from './pages/Channels';
import Leaderboard from './pages/Leaderboard';
import ServerSelection from './pages/ServerSelection';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/select-server" element={<ServerSelection />} />
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Overview />} />
                <Route path="members" element={<Members />} />
                <Route path="channels" element={<Channels />} />
                <Route path="messages" element={<Messages />} />
                <Route path="embeds" element={<Embeds />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="settings" element={<Settings />} />
                <Route
                  path="*"
                  element={
                    <div className="glass-card p-10 rounded-2xl border border-white/5 text-center text-slate-400">
                      <span className="material-symbols-outlined text-5xl text-primary">construction</span>
                      <p className="mt-4">Page under construction.</p>
                      <Navigate to="/" replace />
                    </div>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
