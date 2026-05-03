import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "shield",
    title: "Moderation tận răng",
    desc: "Warn / Mute / Lock / Kick với role auto và timeout thật trên Discord.",
  },
  {
    icon: "bolt",
    title: "Realtime Socket",
    desc: "Mọi action đều phản hồi qua job:update — không cần F5.",
  },
  {
    icon: "smart_toy",
    title: "Placeholder phong phú",
    desc: "Biến động cho message / embed — click là copy.",
  },
  {
    icon: "rocket_launch",
    title: "BullMQ Dispatch",
    desc: "Web ra lệnh, Directive thực thi. Tách biệt rõ ràng, retry tự động.",
  },
];

const STAGES = [
  { key: "discord", label: "Discord OAuth", icon: "login" },
  { key: "redis", label: "Redis Session", icon: "database" },
  { key: "bullmq", label: "BullMQ Queue", icon: "queue" },
  { key: "bot", label: "Bot Execute", icon: "smart_toy" },
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
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-sidebar-border bg-background/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                spa
              </span>
            </div>
            <span className="font-bold text-lg text-on-surface">
              Orias's Pet
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <a href="#features" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
              Features
            </a>
            <a href="#pipeline" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
              Pipeline
            </a>
            <Link
              to="/login"
              className="ml-2 inline-flex items-center gap-1 px-5 py-2 rounded-xl bg-primary text-on-primary text-label-sm hover:opacity-90 transition-opacity shadow-sm"
            >
              Dashboard
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-fixed/30 blur-[140px] rounded-full" />
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
          <p className="text-label-sm uppercase tracking-[0.3em] text-primary mb-6">
            Discord Counselor v2
          </p>
          <h1 className="text-display-lg text-on-surface max-w-3xl mx-auto" style={{ fontSize: '56px' }}>
            Quản lý Discord
            <br />
            chuẩn enterprise.
          </h1>
          <p className="mt-6 text-on-surface-variant max-w-xl mx-auto text-body-lg">
            Web dashboard hợp nhất cho moderation, messaging, embeds, voice
            creator và leveling — điều khiển bot qua BullMQ, realtime qua
            Socket.io.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-on-primary font-medium shadow-md hover:opacity-90 transition-opacity"
            >
              Đăng nhập với Discord
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">code</span>
              Source
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-display-lg text-on-surface mb-10" style={{ fontSize: '32px' }}>
          Vì sao Nexus khác biệt?
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-3xl border border-sidebar-border bg-surface-container-lowest p-8 hover:border-primary/40 transition-colors ambient-shadow"
            >
              <div className="p-3 bg-primary-fixed rounded-xl w-fit mb-4">
                <span className="material-symbols-outlined text-primary">{f.icon}</span>
              </div>
              <h3 className="font-semibold text-lg text-on-surface">{f.title}</h3>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section id="pipeline" className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-display-lg text-on-surface mb-4" style={{ fontSize: '32px' }}>
          Action Bridge
        </h2>
        <p className="text-on-surface-variant mb-10 max-w-xl text-body-lg">
          Mỗi thao tác từ Web được đẩy qua queue{" "}
          <code className="text-primary bg-primary-fixed/30 px-1.5 py-0.5 rounded">discord-actions</code> và thực thi
          bởi Directive. Worker tự retry, Socket trả trạng thái về UI.
        </p>
        <div className="flex flex-wrap gap-3">
          {STAGES.map((s, idx) => (
            <div
              key={s.key}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${
                active === idx
                  ? "border-primary bg-primary-fixed/30 shadow-md"
                  : "border-outline-variant bg-surface-container-lowest"
              }`}
            >
              <span
                className={`material-symbols-outlined text-sm ${
                  active === idx ? "text-primary" : "text-outline"
                }`}
              >
                {s.icon}
              </span>
              <span className={`text-sm font-medium ${active === idx ? 'text-primary' : 'text-on-surface-variant'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sidebar-border py-8 text-center text-xs text-on-surface-variant">
        <p>
          © {new Date().getFullYear()} Orias Nexus. Built for Discord
          communities that mean business.
        </p>
      </footer>
    </div>
  );
}
