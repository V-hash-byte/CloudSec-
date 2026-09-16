import React, { useState } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  HelpCircle, 
  RotateCw,
  Copy,
  Check
} from 'lucide-react';
import { socAudio } from '../../utils/audio';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeIncidentsCount: number;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  activeIncidentsCount,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Hello Analyst. I am your CloudSec AI SecOps Copilot powered by Gemini.
I am continuously observing your multi-cloud telemetry, active incidents, and IAM privilege boundaries.

How can I assist your investigation or containment workflow today?`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const presetQueries = [
    'Explain recent S3 exfiltration via Tor',
    'Generate Sigma rule for IAM AssumeRole abuse',
    'Draft CISO incident briefing for Board',
    'How do I isolate compromised GKE nodes?',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    socAudio.playBlip();

    try {
      const res = await fetch('/api/soc/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          context: {
            activeIncidentsCount,
            securityScore: 78,
          },
        }),
      });

      const data = await res.json();
      const botMsg: Message = {
        sender: 'assistant',
        text: data.answer || 'Analysis completed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      socAudio.playSuccess();
    } catch (err) {
      console.error('Copilot error:', err);
      const botMsg: Message = {
        sender: 'assistant',
        text: 'Unable to reach backend service. Fallback intelligence indicates reviewing high-priority incidents in AWS us-east-1.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-slate-900 border-l border-slate-700/80 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col backdrop-blur-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-white">AI SecOps Copilot</h3>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Gemini 3.8 Flash Online
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Preset Query Chips */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        {presetQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-[10px] font-mono text-cyan-300 border border-slate-700 whitespace-nowrap cursor-pointer transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 font-sans text-xs">
        {messages.map((m, idx) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] p-3 rounded-2xl ${
                  isUser
                    ? 'bg-cyan-500 text-slate-950 font-mono font-medium rounded-tr-none'
                    : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none leading-relaxed'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 px-1">
                {m.timestamp}
              </span>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs p-2 bg-slate-950 rounded-lg border border-slate-800 w-fit">
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
            <span>Analyzing multi-cloud telemetry...</span>
          </div>
        )}
      </div>

      {/* Message Input Box */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask AI Copilot for tactical guidance, Sigma rules..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
