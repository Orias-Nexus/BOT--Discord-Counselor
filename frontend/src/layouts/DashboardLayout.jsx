import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SIDEBAR_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', path: '/' },
  { icon: 'group', label: 'Member Manager', path: '/members' },
  { icon: 'smart_toy', label: 'Bot Settings', path: '/settings' },
  { icon: 'grid_view', label: 'Channel Management', path: '/channels' },
];

export default function DashboardLayout() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen">
      {/* SideNavBar Shell */}
      <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-[#0b0e14] border-r border-white/5 z-[60] font-['Manrope'] font-medium">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-[0_0_20px_rgba(218,185,255,0.3)]">
            <span className="material-symbols-outlined text-on-primary text-2xl">shield_person</span>
          </div>
          <div>
            <h1 className="text-2xl font-black font-['Space_Grotesk'] text-[#dab9ff] leading-none">Project Nexus</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-1">Elite Management</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 mt-4 space-y-2">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={
                  isActive 
                  ? "flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#dab9ff]/20 to-transparent border-l-4 border-[#dab9ff] text-[#dab9ff] hover:translate-x-1 duration-200 group"
                  : "flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-200 hover:bg-[#32353c]/30 transition-all hover:translate-x-1 duration-200"
                }
              >
                <span 
                  className="material-symbols-outlined" 
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-1">
          <a className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-200 transition-all text-sm cursor-pointer">
            <span className="material-symbols-outlined text-lg">help</span>
            <span>Support</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-200 transition-all text-sm cursor-pointer">
            <span className="material-symbols-outlined text-lg">description</span>
            <span>Docs</span>
          </a>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 mt-4 text-error/80 hover:text-error hover:bg-error/10 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* TopNavBar Shell */}
      <header className="fixed top-0 left-64 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#10131a]/40 backdrop-blur-xl shadow-[0_24px_48px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-[#dab9ff] to-[#6c37a9] bg-clip-text text-transparent font-['Space_Grotesk'] tracking-tight">
            Discord Counselor System Admin - Project Nexus
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group hidden md:block">
            <input
              className="bg-surface-container-lowest border-none rounded-full px-6 py-2 w-64 text-sm focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-600 outline-none text-white"
              placeholder="Search data points..." 
              type="text" 
            />
            <span className="material-symbols-outlined absolute right-4 top-2 text-slate-500 text-xl pointer-events-none">search</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button className="hover:bg-white/5 p-2 rounded-full transition-all active:scale-90">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="hover:bg-white/5 p-2 rounded-full transition-all active:scale-90">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="h-10 w-10 flex flex-col justify-center items-center rounded-full border border-primary/20 p-0.5 overflow-hidden bg-surface-container-highest">
              <span className="text-white text-sm font-bold">{user?.name?.charAt(0) || 'A'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="ml-64 pt-24 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
