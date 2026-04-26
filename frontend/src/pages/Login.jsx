import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

function extractTokenFromUrl() {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash) {
    const hashParams = new URLSearchParams(hash);
    const hashToken = hashParams.get("token");
    if (hashToken) return { token: hashToken, source: "hash" };
  }
  const queryParams = new URLSearchParams(window.location.search);
  const queryToken = queryParams.get("token");
  if (queryToken) return { token: queryToken, source: "query" };
  return { token: null };
}

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Rules-of-Hooks: tất cả hooks phải chạy trước mọi early return.
  useEffect(() => {
    const { token, source } = extractTokenFromUrl();
    if (!token) return;

    setIsProcessing(true);
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((userData) => {
        login(token, {
          id: userData.id,
          username: userData.username ?? "Admin",
          avatar: userData.avatar,
        });
        if (source === "hash") {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        } else {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        }
        toast.success(`Welcome, ${userData.username || "friend"}!`);
        navigate("/", { replace: true });
      })
      .catch((err) => {
        console.error("[Login] token verify failed:", err);
        toast.error("Login failed. Please try again.");
      })
      .finally(() => setIsProcessing(false));
  }, [login, navigate]);

  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/discord`;
  };

  if (isAuthenticated && !isProcessing) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-zinc-950 overflow-hidden font-body selection:bg-indigo-500/30">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse-slow opacity-60" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md p-6 animate-fade-in-up">
        <div className="relative group p-10 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-500 hover:border-indigo-500/30 hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.3)]">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-linear-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(99,102,241,0.5)] transform group-hover:scale-105 transition-transform duration-500">
              <LogIn className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white to-zinc-400 mb-3 font-['Space_Grotesk']">
              Orias's Pet
            </h1>
            <p className="text-zinc-400 text-sm mb-10 leading-relaxed max-w-[280px]">
              {isProcessing
                ? "Finalising your session..."
                : "Authenticate with Discord to access the elite management dashboard."}
            </p>

            <button
              type="button"
              onClick={handleLogin}
              disabled={isProcessing}
              className="w-full relative inline-flex items-center justify-center px-6 py-4 font-bold text-white transition-all duration-300 bg-[#5865F2] rounded-xl overflow-hidden group/btn hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(88,101,242,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative flex items-center gap-3 text-[15px]">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
                {isProcessing ? "Signing in..." : "Continue with Discord"}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-zinc-500 font-mono tracking-widest">
          SYSTEM NEXUS v2.1.0
        </div>
      </div>
    </div>
  );
}
