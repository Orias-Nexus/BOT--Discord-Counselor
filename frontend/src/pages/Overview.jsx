import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Overview() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Row: Stats Cards (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-primary/20 transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-sm font-label uppercase tracking-widest group-hover:text-slate-300 transition-colors">Total Members</span>
            <span className="material-symbols-outlined text-primary">groups</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-headline font-bold text-white tracking-tighter">1,250</h3>
            <p className="text-secondary text-xs font-label mt-1">+12% from last week</p>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-primary/20 transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-sm font-label uppercase tracking-widest group-hover:text-slate-300 transition-colors">Active Bots</span>
            <span className="material-symbols-outlined text-primary">smart_toy</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-headline font-bold text-white tracking-tighter">2</h3>
            <p className="text-secondary text-xs font-label mt-1 neon-glow-secondary">System Stable</p>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-primary/20 transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-sm font-label uppercase tracking-widest group-hover:text-slate-300 transition-colors">Online Members</span>
            <span className="material-symbols-outlined text-primary">online_prediction</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-headline font-bold text-white tracking-tighter">875</h3>
            <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-secondary h-full w-[70%] neon-glow-secondary"></div>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-primary/20 transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-sm font-label uppercase tracking-widest group-hover:text-slate-300 transition-colors">Server Uptime</span>
            <span className="material-symbols-outlined text-primary">bolt</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-headline font-bold text-white tracking-tighter">99.9%</h3>
            <p className="text-slate-500 text-xs font-label mt-1">Last restart: 45 days ago</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Middle Section: Member Management Table (Asymmetric Layout) */}
        <div className="col-span-12 lg:col-span-8">
          <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-white/5">
              <h4 className="font-headline text-xl font-bold text-white">Member Management Table</h4>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-label transition-all cursor-pointer">
                  Export CSV
                </button>
                <button className="px-4 py-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg text-xs font-bold transition-all cursor-pointer">
                  Bulk Action
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low/50 text-slate-500 text-[10px] uppercase tracking-widest font-label">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Expiry Time</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {/* Row 1 */}
                  <tr className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">#9921</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest"></div>
                        <span className="text-white font-medium group-hover:text-primary transition-colors">Nightshade#0001</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-tight">Newbie</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">Never</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="text-[10px] font-bold uppercase text-primary-fixed hover:text-primary transition-colors cursor-pointer">Adjust Status</button>
                      <button className="p-1 text-slate-500 hover:text-error transition-colors cursor-pointer inline-flex items-center">
                        <span className="material-symbols-outlined text-lg">gavel</span>
                      </button>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">#8842</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px]">JD</div>
                        <span className="text-white font-medium group-hover:text-primary transition-colors">JohnDoe_Dev</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-tertiary/10 text-tertiary text-[10px] font-bold uppercase tracking-tight">Warn</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">2d 4h left</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="text-[10px] font-bold uppercase text-primary-fixed hover:text-primary transition-colors cursor-pointer">Adjust Status</button>
                      <button className="p-1 text-slate-500 hover:text-error transition-colors cursor-pointer inline-flex items-center">
                        <span className="material-symbols-outlined text-lg">block</span>
                      </button>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">#7731</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest"></div>
                        <span className="text-white font-medium group-hover:text-primary transition-colors">Synth_Lord</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-error/10 text-error text-[10px] font-bold uppercase tracking-tight">Mute</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">12h left</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="text-[10px] font-bold uppercase text-primary-fixed hover:text-primary transition-colors cursor-pointer">Adjust Status</button>
                      <button className="p-1 text-slate-500 hover:text-error transition-colors cursor-pointer inline-flex items-center">
                        <span className="material-symbols-outlined text-lg">volume_off</span>
                      </button>
                    </td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">#4412</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest"></div>
                        <span className="text-white font-medium group-hover:text-primary transition-colors">CyberGhost</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-on-secondary-container/20 text-secondary text-[10px] font-bold uppercase tracking-tight">Good</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">Never</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="text-[10px] font-bold uppercase text-primary-fixed hover:text-primary transition-colors cursor-pointer">Adjust Status</button>
                      <button className="p-1 text-slate-500 hover:text-error transition-colors cursor-pointer inline-flex items-center">
                        <span className="material-symbols-outlined text-lg">logout</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/* Bot Configuration */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h4 className="font-headline text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">tune</span>
              Bot Configuration
            </h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between group">
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Welcome Message</span>
                <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(218,185,255,0.4)] hover:shadow-[0_0_15px_rgba(218,185,255,0.7)] transition-all">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-all"></div>
                </div>
              </div>
              <div className="flex items-center justify-between group">
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Leave Message</span>
                <div className="w-10 h-5 bg-surface-container-highest rounded-full relative cursor-pointer hover:bg-surface-container-highest/80 transition-all">
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-slate-500 rounded-full transition-all"></div>
                </div>
              </div>
              <div className="flex items-center justify-between group">
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Dynamic Voice Channels</span>
                <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(218,185,255,0.4)] hover:shadow-[0_0_15px_rgba(218,185,255,0.7)] transition-all">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-all"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Commands */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h4 className="font-headline text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">terminal</span>
              Quick Commands
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-primary/30 hover:bg-white/10 transition-all cursor-pointer">
                <code className="text-xs text-secondary font-mono group-hover:neon-glow-secondary transition-all">/memberkick</code>
                <button className="bg-primary/10 hover:bg-primary text-primary hover:text-on-primary px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer">Run</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-primary/30 hover:bg-white/10 transition-all cursor-pointer">
                <code className="text-xs text-secondary font-mono group-hover:neon-glow-secondary transition-all">/channelprivate</code>
                <button className="bg-primary/10 hover:bg-primary text-primary hover:text-on-primary px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer">Run</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-primary/30 hover:bg-white/10 transition-all cursor-pointer">
                <code className="text-xs text-secondary font-mono group-hover:neon-glow-secondary transition-all">/categorypublic</code>
                <button className="bg-primary/10 hover:bg-primary text-primary hover:text-on-primary px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer">Run</button>
              </div>
            </div>
          </div>

          {/* System Status Chart */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 overflow-hidden relative">
            <h4 className="font-headline text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">query_stats</span>
              System Status
            </h4>
            
            <div className="h-32 w-full flex items-end gap-1 relative">
              {/* Simulated Chart Lines */}
              <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
                <div className="border-t border-white w-full"></div>
                <div className="border-t border-white w-full"></div>
                <div className="border-t border-white w-full"></div>
              </div>
              
              {/* Abstract Visual Bars */}
              <div className="flex-1 bg-primary/20 hover:bg-primary/40 h-[60%] rounded-t transition-all cursor-help hover:-translate-y-1" title="API Latency: 24ms"></div>
              <div className="flex-1 bg-secondary/20 hover:bg-secondary/40 h-[40%] rounded-t transition-all cursor-help hover:-translate-y-1" title="CPU: 12%"></div>
              <div className="flex-1 bg-primary/20 hover:bg-primary/40 h-[75%] rounded-t transition-all cursor-help hover:-translate-y-1"></div>
              <div className="flex-1 bg-secondary/20 hover:bg-secondary/40 h-[35%] rounded-t transition-all cursor-help hover:-translate-y-1"></div>
              <div className="flex-1 bg-primary/20 hover:bg-primary/40 h-[90%] rounded-t transition-all cursor-help hover:-translate-y-1"></div>
              <div className="flex-1 bg-secondary/20 hover:bg-secondary/40 h-[55%] rounded-t transition-all cursor-help hover:-translate-y-1"></div>
              <div className="flex-1 bg-primary/20 hover:bg-primary/40 h-[45%] rounded-t transition-all cursor-help hover:-translate-y-1"></div>
              <div className="flex-1 bg-secondary/20 hover:bg-secondary/40 h-[80%] rounded-t transition-all cursor-help hover:-translate-y-1"></div>
            </div>
            
            <div className="mt-4 flex justify-between text-[10px] font-label text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_5px_rgba(218,185,255,0.8)]"></span> API Latency</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_5px_rgba(70,245,224,0.8)]"></span> CPU Usage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
