import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Server, LogOut, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";

export default function ServerSelection() {
  const {
    isAuthenticated,
    guilds,
    setSelectedServerId,
    isLoadingGuilds,
    logout,
    refreshGuilds,
  } = useAuth();
  const navigate = useNavigate();
  const [selectingServerId, setSelectingServerId] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    // Keep original behaviour: nếu lần đầu không có guild, không tự refresh liên tục.
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleSelect = async (id) => {
    try {
      setSelectingServerId(id);
      await api.get(`/servers/${id}/discord-info`);
      setSelectedServerId(id);
      navigate("/");
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.error || "";
      const botMissing =
        status === 404 ||
        (status === 403 && message.includes("Guild not found in cache"));
      if (botMissing) {
        const inviteRes = await api
          .get(`/auth/bot-invite?guildId=${encodeURIComponent(id)}`)
          .catch(() => null);
        const inviteUrl = inviteRes?.data?.inviteUrl;
        toast.error(
          "Bot chưa tham gia server này. Hãy mời bot trước khi cấu hình.",
        );
        if (
          inviteUrl &&
          window.confirm(
            "Bot chưa tham gia server. Bạn có muốn mở trang mời bot ngay bây giờ không?",
          )
        ) {
          window.open(inviteUrl, "_blank", "noopener,noreferrer");
        }
        return;
      }
      toast.error(message || "Không thể truy cập server này.");
    } finally {
      setSelectingServerId("");
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-zinc-950 overflow-hidden font-body selection:bg-indigo-500/30 py-12">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-purple-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse-slow delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 mb-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white leading-none tracking-tight">
              Orias's Pet
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mt-1">
              Select Instance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshGuilds}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoadingGuilds ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => logout({ reason: "manual" })}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Disconnect</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-white via-indigo-200 to-zinc-400 mb-4 tracking-tight">
            Select an Environment
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto">
            Choose a Discord server to load into the dashboard. You must have
            Administrator or Manage Server permissions.
          </p>
        </div>

        {isLoadingGuilds ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-zinc-400 animate-pulse">
              Syncing permissions with Discord...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {guilds && guilds.length > 0 ? (
              guilds.map((g, index) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => handleSelect(g.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  disabled={Boolean(selectingServerId)}
                  className="group relative text-left bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:bg-zinc-800/60 hover:border-indigo-500/50 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.2)] overflow-hidden animate-fade-in-up disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="relative flex items-center gap-4">
                    {g.icon ? (
                      <img
                        src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`}
                        alt=""
                        className="w-14 h-14 rounded-full border-2 border-zinc-700 group-hover:border-indigo-400 object-cover transition-colors"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-zinc-700 group-hover:border-indigo-400 flex items-center justify-center text-xl font-bold text-white transition-colors">
                        {g.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white truncate">
                        {g.name}
                      </h3>
                      <p className="text-xs text-zinc-500 font-mono mt-1 group-hover:text-indigo-300/70 truncate">
                        {g.owner ? "Owner" : "Admin"} • {g.id}
                      </p>
                      {selectingServerId === g.id && (
                        <p className="text-xs text-indigo-300 mt-2 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Checking bot in server...
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                <div className="w-16 h-16 mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-500">
                  <Server className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-zinc-300 mb-2">
                  No Servers Found
                </h3>
                <p className="text-zinc-500 text-center max-w-md">
                  We couldn't find any Discord servers where you have
                  administrative access. Make sure the bot is invited to your
                  server.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
