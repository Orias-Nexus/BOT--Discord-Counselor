import {
  Outlet,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import VariablesDrawer from "../components/VariablesDrawer";

const SIDEBAR_ITEMS = [
  { icon: "dashboard", label: "Dashboard", path: "/" },
  { icon: "group", label: "Members", path: "/members" },
  { icon: "grid_view", label: "Channels", path: "/channels" },
  { icon: "forum", label: "Messages", path: "/messages" },
  { icon: "article", label: "Embeds", path: "/embeds" },
  { icon: "emoji_events", label: "Leaderboard", path: "/leaderboard" },
  { icon: "smart_toy", label: "Settings", path: "/settings" },
];

export default function DashboardLayout() {
  const {
    isAuthenticated,
    logout,
    user,
    guilds,
    selectedServerId,
    setSelectedServerId,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !selectedServerId && guilds.length > 0) {
      navigate("/select-server", { replace: true });
    }
  }, [isAuthenticated, selectedServerId, guilds.length, navigate]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!selectedServerId && guilds.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            sync
          </span>
          <p className="mt-4 text-slate-400">Loading server list...</p>
        </div>
      </div>
    );
  }

  if (!selectedServerId) return null;

  const initial = (user?.username || user?.name || "A").charAt(0).toUpperCase();

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen">
      <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-surface-container-lowest border-r border-white/5 z-60 font-['Manrope'] font-medium">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary-container flex items-center justify-center shadow-[0_0_20px_rgba(218,185,255,0.3)]">
            <span className="material-symbols-outlined text-on-primary text-2xl">
              shield_person
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-black font-['Space_Grotesk'] text-[#dab9ff] leading-none">
              Orias's Pet
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-1">
              Elite Management
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={
                  isActive
                    ? "flex items-center gap-3 px-4 py-3 bg-linear-to-r from-[#dab9ff]/20 to-transparent border-l-4 border-[#dab9ff] text-[#dab9ff] duration-200"
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
          <button
            type="button"
            onClick={() => logout({ reason: "manual" })}
            className="w-full flex items-center gap-3 px-4 py-3 mt-2 text-error/80 hover:text-error hover:bg-error/10 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <header className="fixed top-0 left-64 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#10131a]/40 backdrop-blur-xl shadow-[0_24px_48px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold bg-linear-to-r from-[#dab9ff] to-primary-container bg-clip-text text-transparent font-['Space_Grotesk'] tracking-tight">
            Discord Counselor — Admin
          </h2>
        </div>
        <div className="flex items-center gap-6">
          {guilds && guilds.length > 0 && (
            <div className="relative group hidden md:block">
              <select
                value={selectedServerId || ""}
                onChange={(e) => setSelectedServerId(e.target.value)}
                className="appearance-none bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-2 pr-10 text-sm focus:ring-1 focus:ring-primary transition-all text-white outline-none cursor-pointer hover:border-primary/30"
              >
                <option value="" disabled>
                  Select a Server
                </option>
                {guilds.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-500 text-sm pointer-events-none">
                expand_more
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 text-slate-400">
            <span className="hidden md:inline text-sm text-slate-300">
              {user?.username || user?.name || "Admin"}
            </span>
            <div className="h-10 w-10 flex items-center justify-center rounded-full border border-primary/20 overflow-hidden bg-surface-container-highest">
              {user?.avatar && user?.id ? (
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`}
                  alt={user.username || "avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-bold">{initial}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="ml-64 pt-24 p-8 min-h-screen">
        <Outlet />
      </main>

      <VariablesDrawer />
    </div>
  );
}
