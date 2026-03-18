import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, ChevronRight, Activity } from 'lucide-react';
import api from '../utils/api';

export default function Overview() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real scenario, this would fetch from an endpoint that returns the user's servers
    // e.g. /api/users/me/guilds
    // For now we will mock this or fetch available configured servers from the backend
    const fetchServers = async () => {
      try {
        // Assume backend has an endpoint for user guilds, maybe we can just get /api/auth/me later
        // Let's mock the servers list for UI demonstration or use an existing API.
        setServers([
          { id: '123456789', name: 'Developer Hub', icon: null, active: true },
          { id: '987654321', name: 'Gaming Community', icon: null, active: false }
        ]);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch servers', err);
        setLoading(false);
      }
    };
    
    fetchServers();
  }, []);

  const handleSelectServer = (serverId) => {
    // Navigate to server configuration or save to Context
    navigate(`/servers/${serverId}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">My Servers</h1>
        <p className="text-zinc-400">Select a server to manage counselor settings and configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {loading ? (
          <div className="text-zinc-500 flex items-center gap-2">
            <Activity className="w-4 h-4 animate-spin" /> Loading servers...
          </div>
        ) : (
          servers.map((server) => (
            <div 
              key={server.id}
              onClick={() => handleSelectServer(server.id)}
              className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 cursor-pointer hover:border-indigo-500/50 hover:bg-zinc-800/80 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between h-48"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-indigo-500/20" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center border border-zinc-700 shadow-md">
                  {server.icon ? (
                    <img src={server.icon} alt={server.name} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <Server className="w-8 h-8 text-zinc-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{server.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${server.active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm text-zinc-400">{server.active ? 'Bot Active' : 'Setup Required'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-6 relative z-10">
                <span className="text-sm text-zinc-500 font-mono">{server.id}</span>
                <div className="flex items-center gap-1 text-sm font-medium text-indigo-400 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Manage <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
