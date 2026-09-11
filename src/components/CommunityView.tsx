import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Code2,
  Users,
  Hash,
  ShieldCheck,
} from 'lucide-react';
import { CommunityMessage, User as UserType } from '../types';

interface CommunityViewProps {
  currentUser: UserType | null;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ currentUser }) => {
  const [channel, setChannel] = useState<'general' | 'algorithms' | 'interview-prep'>('general');
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load channel messages
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?channel=${channel}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 6000);
    return () => clearInterval(interval);
  }, [channel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !inputCode.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser?.id ? { 'Authorization': `Bearer ${currentUser.id}` } : {})
        },
        body: JSON.stringify({
          channel,
          text: inputText,
          codeSnippet: inputCode.trim() || undefined
        })
      });

      const newMsg = await res.json();
      setMessages(prev => [...prev, newMsg]);
      setInputText('');
      setInputCode('');
      setShowCodeInput(false);
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-60px)] md:h-screen px-3 sm:px-6 lg:px-8 py-3 sm:py-6 flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row rounded-3xl bg-[#0e0e15] border border-[#1c1c28] shadow-2xl overflow-hidden min-h-0">
        {/* Left Sidebar / Top Channels on Mobile */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#1c1c28] bg-[#09090e] p-3 sm:p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-2 sm:space-y-4">
            <div className="flex items-center space-x-2 px-1 sm:px-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF5A43]" />
              <span>Channels</span>
            </div>

            <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
              {[
                { id: 'general', name: 'general', desc: 'Study groups & intros' },
                { id: 'algorithms', name: 'algorithms', desc: 'Code review & solutions' },
                { id: 'interview-prep', name: 'interviews', desc: 'Mock interviews & tips' }
              ].map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setChannel(ch.id as any)}
                  className={`shrink-0 md:shrink md:w-full text-left px-3 py-2 rounded-2xl text-xs font-semibold flex items-center md:items-start space-x-2 transition-colors cursor-pointer ${
                    channel === ch.id
                      ? 'bg-[#FF5A43]/20 text-[#FF8570] border border-[#FF5A43]/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#14141e]'
                  }`}
                >
                  <Hash className="w-3.5 h-3.5 shrink-0" />
                  <div>
                    <div className="text-slate-200 whitespace-nowrap">{ch.name}</div>
                    <div className="hidden md:block text-[10px] text-slate-500 font-normal">{ch.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block pt-4 border-t border-[#1c1c28] px-2 space-y-2">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF5A43] animate-pulse"></span>
              <span>Online Academy Members</span>
            </div>
            <div className="text-[11px] text-slate-500 leading-tight">
              Share solutions, solicit feedback, or ask peer engineers and mentors for hints.
            </div>
          </div>
        </div>

        {/* Right Main Chat Area */}
        <div className="flex-1 flex flex-col bg-[#07070a] overflow-hidden min-h-0">
          {/* Channel Header */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#1c1c28] bg-[#0e0e15] flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4 text-[#FF5A43]" />
              <span className="font-bold text-sm text-white capitalize">{channel.replace('-', ' ')}</span>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400">
              Live updates synced to database
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4 text-xs">
            {messages.map(msg => {
              const isAdmin = msg.senderRole === 'admin' || msg.senderRole === 'faculty';

              return (
                <div key={msg.id} className="flex items-start space-x-3 group">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isAdmin
                      ? 'bg-gradient-to-br from-[#FF5A43] to-[#F03E23] text-white shadow-md shadow-[#FF5A43]/20'
                      : 'bg-[#1c1c28] text-[#FF8570] border border-[#2e2e42]'
                  }`}>
                    {msg.senderName.charAt(0).toUpperCase()}
                  </div>

                  <div className="space-y-1 flex-1 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-200 text-xs">{msg.senderName}</span>
                      {isAdmin && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FF5A43]/20 text-[#FF8570] border border-[#FF5A43]/30 flex items-center space-x-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Mentor</span>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#0e0e15] border border-[#1c1c28] text-slate-200 leading-relaxed shadow-sm">
                      <p className="whitespace-pre-line">{msg.text}</p>
                      {msg.codeSnippet && (
                        <div className="mt-2 rounded-xl bg-[#07070a] overflow-hidden border border-[#222232]">
                          {typeof msg.codeSnippet === 'object' && msg.codeSnippet !== null && msg.codeSnippet.language && (
                            <div className="px-2.5 py-1 bg-[#14141e] border-b border-[#222232] text-[10px] font-mono text-[#FF8570] uppercase tracking-wider flex items-center justify-between">
                              <span>{msg.codeSnippet.language}</span>
                              <Code2 className="w-3 h-3 text-slate-500" />
                            </div>
                          )}
                          <pre className="p-2.5 font-mono text-[11px] text-slate-200 overflow-x-auto whitespace-pre">
                            {typeof msg.codeSnippet === 'object' && msg.codeSnippet !== null
                              ? (msg.codeSnippet.code || JSON.stringify(msg.codeSnippet, null, 2))
                              : String(msg.codeSnippet)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-[#1c1c28] bg-[#0e0e15] space-y-2 shrink-0">
            {showCodeInput && (
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Attach Code Snippet:</span>
                  <button
                    type="button"
                    onClick={() => setShowCodeInput(false)}
                    className="text-slate-500 hover:text-white text-[11px] cursor-pointer"
                  >
                    Cancel Code
                  </button>
                </div>
                <textarea
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value)}
                  placeholder="// Paste your algorithm or code block here..."
                  rows={3}
                  className="w-full p-2.5 rounded-2xl bg-[#07070a] font-mono text-xs text-slate-200 border border-[#242436] focus:outline-none focus:border-[#FF5A43]"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowCodeInput(!showCodeInput)}
                title="Attach Code Snippet"
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  showCodeInput
                    ? 'bg-[#FF5A43]/20 text-[#FF8570] border-[#FF5A43]/50'
                    : 'bg-[#14141e] text-slate-400 border-[#242436] hover:text-white hover:bg-[#1c1c28]'
                }`}
              >
                <Code2 className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={`Message #${channel}...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#14141e] text-xs text-white placeholder-slate-500 border border-[#242436] focus:outline-none focus:border-[#FF5A43]"
              />

              <button
                type="submit"
                disabled={isSending || (!inputText.trim() && !inputCode.trim())}
                className="p-2.5 rounded-xl bg-[#FF5A43] hover:bg-[#F03E23] text-white disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
