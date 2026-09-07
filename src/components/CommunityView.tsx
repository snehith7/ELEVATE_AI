import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Code2,
  Users,
  Hash,
  Sparkles,
  Smile,
  ShieldCheck,
  User,
  Clock
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
          'Authorization': `Bearer ${currentUser?.id || 'usr_student_demo'}`
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl overflow-hidden">
        {/* Left Sidebar: Channels & Peer Presence (3 cols) */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-[#0c1220] p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Channels</span>
            </div>

            <div className="space-y-1">
              {[
                { id: 'general', name: 'general-discussion', desc: 'Introductions & study groups' },
                { id: 'algorithms', name: 'algorithm-strategies', desc: 'Code review & solutions' },
                { id: 'interview-prep', name: 'interview-prep', desc: 'Mock tech interviews & tips' }
              ].map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setChannel(ch.id as any)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-start space-x-2 transition-colors ${
                    channel === ch.id
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Hash className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-200">{ch.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{ch.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 px-2 space-y-2">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online Academy Members</span>
            </div>
            <div className="text-[11px] text-slate-500 leading-tight">
              Share solutions, solicit feedback, or ask peer engineers and mentors for hints.
            </div>
          </div>
        </div>

        {/* Right Main Chat Area */}
        <div className="flex-1 flex flex-col bg-[#0b0f19] overflow-hidden">
          {/* Channel Header */}
          <div className="px-6 py-3 border-b border-slate-800 bg-[#0f172a] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-sm text-white capitalize">{channel.replace('-', ' ')}</span>
            </div>
            <div className="text-xs text-slate-400">
              Live updates synced to database
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
            {messages.map(msg => {
              const isMe = msg.senderId === currentUser?.id;
              const isAdmin = msg.senderRole === 'admin';

              return (
                <div key={msg.id} className="flex items-start space-x-3 group">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isAdmin
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'bg-indigo-600 text-white'
                  }`}>
                    {msg.senderName.charAt(0).toUpperCase()}
                  </div>

                  <div className="space-y-1 flex-1 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-200 text-xs">{msg.senderName}</span>
                      {isAdmin && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center space-x-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Mentor</span>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200 leading-relaxed">
                      <p className="whitespace-pre-line">{msg.text}</p>
                      {msg.codeSnippet && (
                        <pre className="mt-2 p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-indigo-200 overflow-x-auto border border-slate-800">
                          {msg.codeSnippet}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-[#0f172a] space-y-2">
            {showCodeInput && (
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Attach Code Snippet:</span>
                  <button
                    type="button"
                    onClick={() => setShowCodeInput(false)}
                    className="text-slate-500 hover:text-white text-[11px]"
                  >
                    Cancel Code
                  </button>
                </div>
                <textarea
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value)}
                  placeholder="// Paste your algorithm or code block here..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowCodeInput(!showCodeInput)}
                title="Attach Code Snippet"
                className={`p-2.5 rounded-xl border transition-colors ${
                  showCodeInput
                    ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Code2 className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={`Message #${channel}...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-xs text-white placeholder-slate-500 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                disabled={isSending || (!inputText.trim() && !inputCode.trim())}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors cursor-pointer"
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
