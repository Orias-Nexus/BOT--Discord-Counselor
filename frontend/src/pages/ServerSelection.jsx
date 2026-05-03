import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* Top App Bar */}
      <header className="w-full h-16 sticky top-0 z-40 bg-surface-bright/80 backdrop-blur-md flex items-center justify-between px-8 border-b border-surface-variant">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              eco
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={refreshGuilds}
            className="w-10 h-10 rounded-full flex items-center justify-center text-outline hover:text-primary transition-colors"
          >
            <span
              className={`material-symbols-outlined ${isLoadingGuilds ? "animate-spin" : ""}`}
            >
              sync
            </span>
          </button>
          <button
            type="button"
            onClick={() => logout({ reason: "manual" })}
            className="w-10 h-10 rounded-full flex items-center justify-center text-outline hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start pt-16 pb-16 px-10">
        {/* Header Section */}
        <div className="text-center mb-16 max-w-2xl">
          <h1 className="text-display-lg text-on-surface mb-4">
            Select a Workspace
          </h1>
          <p className="text-body-lg text-on-surface-variant">
            Choose a server to manage its settings, members, and analytics.
          </p>
        </div>

        {/* Server Cards Grid */}
        {isLoadingGuilds ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">
              sync
            </span>
            <p className="text-on-surface-variant animate-pulse">
              Syncing permissions with Discord...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
            {guilds && guilds.length > 0 ? (
              guilds.map((g, index) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => handleSelect(g.id)}
                  style={{ animationDelay: `${index * 60}ms` }}
                  disabled={Boolean(selectingServerId)}
                  className="bg-surface-container-lowest rounded-3xl p-8 ambient-shadow-lg flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300 disabled:opacity-60 disabled:cursor-not-allowed animate-fade-in-up cursor-pointer group"
                >
                  {/* Server Avatar */}
                  <div className="w-24 h-24 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-6 overflow-hidden border-2 border-surface-container-low group-hover:border-primary/30 transition-colors">
                    {g.icon ? (
                      <img
                        src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold">
                        {g.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>

                  {/* Server Info */}
                  <h2 className="text-headline-md text-on-surface mb-2 truncate max-w-full">
                    {g.name}
                  </h2>
                  <div className="flex items-center gap-2 text-outline mb-6">
                    <span className="material-symbols-outlined text-sm">
                      {g.owner ? "shield" : "admin_panel_settings"}
                    </span>
                    <span className="text-label-sm">
                      {g.owner ? "Owner" : "Admin"}
                    </span>
                  </div>

                  {/* Loading indicator */}
                  {selectingServerId === g.id ? (
                    <div className="flex items-center gap-2 text-primary text-sm">
                      <span className="material-symbols-outlined text-sm animate-spin">
                        sync
                      </span>
                      Checking bot in server...
                    </div>
                  ) : (
                    <div className="mt-auto w-full py-3 px-6 bg-primary text-on-primary rounded-full text-label-sm hover:bg-surface-tint transition-colors">
                      Go to Dashboard
                    </div>
                  )}
                </button>
              ))
            ) : (
              /* No servers found */
              <div className="col-span-full bg-surface-container-low border-2 border-dashed border-outline-variant rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[320px]">
                <div className="w-16 h-16 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[32px]">
                    dns
                  </span>
                </div>
                <h2 className="text-headline-md text-on-surface mb-2">
                  No Servers Found
                </h2>
                <p className="text-body-md text-on-surface-variant max-w-md">
                  We couldn't find any Discord servers where you have
                  administrative access. Make sure the bot is invited to your
                  server.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
