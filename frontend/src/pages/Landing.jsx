import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  ShieldCheck,
  Zap,
  Rocket,
  ChevronRight,
  Github,
} from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Moderation tận răng",
    desc: "Warn / Mute / Lock / Kick với role auto và timeout thật trên Discord.",
  },
  {
    icon: Zap,
    title: "Realtime Socket",
    desc: "Mọi action đều phản hồi qua job:update — không cần F5.",
  },
  {
    icon: Bot,
    title: "Placeholder phong phú",
    desc: "Biến động cho message / embed — click là copy.",
  },
  {
    icon: Rocket,
    title: "BullMQ Dispatch",
    desc: "Web ra lệnh, Directive thực thi. Tách biệt rõ ràng, retry tự động.",
  },
];

const STAGES = [
  { key: "discord", label: "Discord OAuth" },
  { key: "redis", label: "Redis Session" },
  { key: "bullmq", label: "BullMQ Queue" },
  { key: "bot", label: "Bot Execute" },
];

export default function Landing() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActive((i) => (i + 1) % STAGES.length),
      1400,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-body">
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-white/5 bg-zinc-950/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <Bot className="w-5 h-5" />
            </div>
            <span className="font-bold font-['Space_Grotesk'] text-lg">
              Orias's Pet
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <a
              href="#features"
              className="text-sm text-zinc-400 hover:text-white"
            >
              Features
            </a>
            <a
              href="#pipeline"
              className="text-sm text-zinc-400 hover:text-white"
            >
              Pipeline
            </a>
            <Link
              to="/login"
              className="ml-2 inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-sm font-medium"
            >
              Dashboard <ChevronRight className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 blur-[140px] rounded-full" />
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300 mb-6">
            Discord Counselor v2
          </p>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight font-['Space_Grotesk'] bg-gradient-to-r from-white via-indigo-200 to-zinc-300 bg-clip-text text-transparent">
            Quản lý Discord
            <br />
            chuẩn enterprise.
          </h1>
          <p className="mt-6 text-zinc-400 max-w-xl mx-auto">
            Web dashboard hợp nhất cho moderation, messaging, embeds, voice
            creator và leveling — điều khiển bot qua BullMQ, realtime qua
            Socket.io.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-medium shadow-[0_10px_40px_-10px_rgba(99,102,241,0.6)]"
            >
              Đăng nhập với Discord <ChevronRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-800 hover:border-zinc-600 text-zinc-300"
            >
              <Github className="w-4 h-4" /> Source
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold tracking-tight mb-10">
          Vì sao Nexus khác biệt?
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-indigo-500/40 transition-colors"
            >
              <f.icon className="w-6 h-6 text-indigo-400 mb-4" />
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="pipeline" className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          Action Bridge
        </h2>
        <p className="text-zinc-400 mb-10 max-w-xl">
          Mỗi thao tác từ Web được đẩy qua queue{" "}
          <code className="text-indigo-300">discord-actions</code> và thực thi
          bởi Directive. Worker tự retry, Socket trả trạng thái về UI.
        </p>
        <div className="flex flex-wrap gap-3">
          {STAGES.map((s, idx) => (
            <div
              key={s.key}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all ${
                active === idx
                  ? "border-indigo-400 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.35)]"
                  : "border-zinc-800 bg-zinc-900/40"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  active === idx ? "bg-indigo-300 animate-pulse" : "bg-zinc-600"
                }`}
              />
              <span className="text-sm font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-zinc-500">
        <p>
          © {new Date().getFullYear()} Orias Nexus. Built for Discord
          communities that mean business.
        </p>
      </footer>
    </div>
  );
}
