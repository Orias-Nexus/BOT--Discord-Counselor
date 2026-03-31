import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Nếu đã đăng nhập rồi thì chuyển thẳng về Dashboard
  if (isAuthenticated) return <Navigate to="/" replace />;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((userData) => {
          login(token, {
            name: userData.username ?? 'Admin',
            id: userData.id,
            avatar: userData.avatar,
          });
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/');
        })
        .catch(() => {
          login(token, { name: 'Admin' });
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/');
        });
    }
  }, [login, navigate]);

  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/discord`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black">
      <div className="relative p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl overflow-hidden max-w-sm w-full transition-all hover:border-zinc-700/50">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none" />

        <div className="relative flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-linear-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
            <LogIn className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Discord Counselor
          </h1>
          <p className="text-zinc-400 text-sm mb-8">
            Enterprise-level server administration & moderation dashboard.
          </p>

          <button
            onClick={handleLogin}
            className="w-full relative group inline-flex items-center justify-center px-6 py-3 font-semibold text-white transition-all duration-200 bg-[#5865F2] hover:bg-[#4752C4] rounded-xl overflow-hidden"
          >
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
            <span className="relative flex items-center gap-2">
              Login with Discord
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
