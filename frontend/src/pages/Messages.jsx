import { useState } from 'react';
import { MessageSquarePlus, Edit3, Trash2 } from 'lucide-react';

export default function Messages() {
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'embeds'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Messaging & Embeds</h1>
          <p className="text-zinc-400">Configure welcome messages, logging formats, and custom embeds.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20">
          <MessageSquarePlus className="w-4 h-4" /> Create New
        </button>
      </div>

      <div className="flex border-b border-zinc-800 mb-6">
        <button 
          onClick={() => setActiveTab('messages')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'messages' ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          System Messages
          {activeTab === 'messages' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('embeds')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'embeds' ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          Custom Embeds
          {activeTab === 'embeds' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></span>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg group hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">Welcome Message</h3>
            <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors"><Edit3 className="w-4 h-4" /></button>
              <button className="p-1.5 bg-zinc-800 hover:bg-red-500/20 text-red-400 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
          <p className="text-sm text-zinc-400 mb-4 line-clamp-3">
            "Welcome to the server {`{user_tag}`}! Please read the rules in the rules channel before participating."
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800">Trigger: Greeting</span>
            <span className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800">Channel: #general</span>
          </div>
        </div>
      </div>
    </div>
  );
}
