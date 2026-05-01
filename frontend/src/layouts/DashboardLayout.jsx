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
  { icon: "grid_view", label: "Overview", path: "/" },
  { icon: "group", label: "Members", path: "/members" },
  { icon: "hub", label: "Channels", path: "/channels" },
  { icon: "receipt_long", label: "Logs", path: "/messages" },
  { icon: "integration_instructions", label: "Embeds", path: "/embeds" },
  { icon: "emoji_events", label: "Leaderboard", path: "/leaderboard" },
  { icon: "settings", label: "Settings", path: "/settings" },
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
      <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            sync
          </span>
          <p className="mt-4 text-on-surface-variant">Loading server list...</p>
        </div>
      </div>
    );
  }

  if (!selectedServerId) return null;

  const initial = (user?.username || user?.name || "A").charAt(0).toUpperCase();

  const selectedGuild = guilds.find((g) => g.id === selectedServerId);

  return (
    <div className="bg-background text-on-surface min-h-screen flex">
      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 h-full z-40 flex flex-col bg-sidebar w-72 border-r border-sidebar-border px-6 py-10">
        {/* Brand */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              smart_toy
            </span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-on-surface tracking-tight leading-tight">
              Orias's Pet
            </h1>
            <p className="text-label-sm text-on-surface-variant">
              Studio Workspace
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
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
                    ? "flex items-center gap-4 text-nav-active bg-nav-active-bg rounded-2xl px-5 py-3 border-l-4 border-nav-active shadow-sm transition-all duration-200 ease-in-out text-sm font-medium"
                    : "flex items-center gap-4 text-nav-inactive px-5 py-3 hover:text-nav-active hover:bg-nav-active-bg/50 rounded-2xl transition-all duration-200 ease-in-out cursor-pointer active:scale-95 text-sm font-medium"
                }
              >
                <span
                  className="material-symbols-outlined"
                  style={
                    isActive
                      ? { fontVariationSettings: "'FILL' 1" }
                      : {}
                  }
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto space-y-1 pt-8 border-t border-outline-variant/30">
          <Link
            to="/landing"
            className="flex items-center gap-4 text-nav-inactive px-5 py-3 hover:text-nav-active hover:bg-nav-active-bg/50 rounded-2xl transition-all duration-200 ease-in-out text-sm font-medium"
          >
            <span className="material-symbols-outlined">contact_support</span>
            Support
          </Link>
          <button
            type="button"
            onClick={() => logout({ reason: "manual" })}
            className="w-full flex items-center gap-4 text-nav-inactive px-5 py-3 hover:text-error hover:bg-error-container/30 rounded-2xl transition-all duration-200 ease-in-out text-sm font-medium"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 ml-72 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-background border-b border-sidebar-border ambient-shadow flex justify-between items-center w-full px-8 h-20 flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center">
            {/* Search Bar */}
            <div className="relative ml-4">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline-variant">
                search
              </span>
              <input
                className="pl-10 pr-4 py-2 bg-on-surface/5 border border-transparent focus:border-primary-container focus:ring-0 rounded-full text-sm w-64 transition-colors placeholder:text-on-surface-variant/50 text-on-surface"
                placeholder="Search workspace..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Server Selector */}
            {guilds && guilds.length > 0 && (
              <div className="relative hidden md:block">
                <select
                  value={selectedServerId || ""}
                  onChange={(e) => setSelectedServerId(e.target.value)}
                  className="appearance-none bg-surface-container-low border border-sidebar-border rounded-xl px-4 py-2 pr-10 text-sm focus:ring-1 focus:ring-primary transition-all text-on-surface outline-none cursor-pointer hover:border-primary/30"
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
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant text-sm pointer-events-none">
                  expand_more
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <button title="Notifications — coming soon" className="p-2 text-on-surface-variant hover:bg-sidebar hover:text-nav-active transition-colors duration-300 rounded-full cursor-pointer active:scale-95 opacity-50">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <Link to="/settings" title="Settings" className="p-2 text-on-surface-variant hover:bg-sidebar hover:text-nav-active transition-colors duration-300 rounded-full active:scale-95">
              <span className="material-symbols-outlined">help_outline</span>
            </Link>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-sm text-on-surface-variant font-medium">
                {user?.username || user?.name || "Admin"}
              </span>
              <div className="h-9 w-9 rounded-full overflow-hidden border border-sidebar-border">
                {user?.avatar && user?.id ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`}
                    alt={user.username || "avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed text-sm font-bold">
                    {initial}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <VariablesDrawer />
    </div>
  );
}
