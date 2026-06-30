import { useState, useEffect, useRef } from 'react';
import { Send, Search, MessageSquare, UserCircle2 } from 'lucide-react';
import { useCollection } from '@/hooks/useCollection';
import type { Candidate } from '@/types';

interface ChatMessage {
  id: string;
  applicationId: string;
  senderRole: 'candidate' | 'recruiter';
  text: string;
  timestamp: string;
  senderName: string;
}

export default function MessagesPage() {
  const { items: applications } = useCollection<Candidate>('candidates');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const CHATS_URL = `${API_BASE}/api/collections/chats`;

  // Fetch all chats to build the inbox list
  useEffect(() => {
    let isMounted = true;
    const fetchMessages = async () => {
      try {
        const res = await fetch(CHATS_URL);
        if (res.ok && isMounted) {
          const data = await res.json();
          setMessages(data.sort((a: ChatMessage, b: ChatMessage) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
        }
      } catch (e) {
        console.error('Failed to fetch messages', e);
      }
    };
    
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [CHATS_URL]);

  // Scroll to bottom when new messages arrive for active chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeAppId]);

  // Derive unique conversations based on applications that have messages, or just list all applications
  const activeChatMessages = messages.filter(m => m.applicationId === activeAppId);
  const activeApp = applications.find(a => a.id === activeAppId);

  // For the left pane, let's just list all candidates who have applied
  const conversations = applications.map(app => {
    const appMessages = messages.filter(m => m.applicationId === app.id);
    const lastMessage = appMessages.length > 0 ? appMessages[appMessages.length - 1] : null;
    return {
      app,
      lastMessage,
      timestamp: lastMessage ? new Date(lastMessage.timestamp).getTime() : new Date(app.appliedDate).getTime()
    };
  }).sort((a, b) => b.timestamp - a.timestamp);

  const sendMessage = async () => {
    if (!inputText.trim() || !activeAppId) return;
    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      applicationId: activeAppId,
      senderRole: 'recruiter',
      text: inputText,
      timestamp: new Date().toISOString(),
      senderName: 'Recruiter',
    };
    
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    
    try {
      await fetch(CHATS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      });
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white border border-[#ECE8E2] rounded-2xl overflow-hidden shadow-sm">
      {/* Left Pane: Inbox List */}
      <div className="w-80 border-r border-[#ECE8E2] bg-[#FAF9F7] flex flex-col">
        <div className="p-4 border-b border-[#ECE8E2] bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#5B4FE9]"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-stone-500">No conversations yet.</div>
          ) : (
            conversations.map(({ app, lastMessage }) => (
              <button 
                key={app.id}
                onClick={() => setActiveAppId(app.id)}
                className={`w-full text-left p-4 border-b border-[#ECE8E2]/50 hover:bg-white transition-colors ${activeAppId === app.id ? 'bg-white border-l-2 border-l-[#5B4FE9]' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-[#151633] text-sm truncate">{app.name}</span>
                  {lastMessage && (
                    <span className="text-[10px] text-stone-400 whitespace-nowrap ml-2">
                      {new Date(lastMessage.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-[#5B4FE9] mb-1.5 truncate">{app.jobTitle}</div>
                <div className="text-xs text-stone-500 truncate">
                  {lastMessage ? (
                    <span className={lastMessage.senderRole === 'candidate' && activeAppId !== app.id ? 'font-bold text-stone-800' : ''}>
                      {lastMessage.senderRole === 'recruiter' ? 'You: ' : ''}{lastMessage.text}
                    </span>
                  ) : (
                    <span className="italic">No messages yet</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat */}
      <div className="flex-1 flex flex-col bg-white">
        {activeAppId && activeApp ? (
          <>
            {/* Chat Header */}
            <div className="h-[72px] border-b border-[#ECE8E2] px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                  <UserCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-bold text-[#151633] leading-tight">{activeApp.name}</h2>
                  <p className="text-xs text-stone-500 font-medium">Applying for {activeApp.jobTitle}</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fbfaff]">
              {activeChatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400">
                  <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">Start the conversation with {activeApp.name}</p>
                </div>
              ) : (
                activeChatMessages.map((m) => (
                  <div key={m.id} className={`flex ${m.senderRole === 'recruiter' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-5 py-3 text-[14.5px] shadow-sm ${m.senderRole === 'recruiter' ? 'bg-[#5B4FE9] text-white rounded-br-sm' : 'bg-white border border-stone-100 text-[#151633] rounded-bl-sm'}`}>
                      <div className="leading-relaxed">{m.text}</div>
                      <div className={`text-[10px] font-medium mt-1.5 text-right ${m.senderRole === 'recruiter' ? 'text-indigo-200' : 'text-stone-400'}`}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-[#ECE8E2]">
              <div className="flex items-end gap-2 bg-stone-50 border border-stone-200 rounded-2xl p-2 focus-within:border-indigo-300 focus-within:ring-1 focus-within:ring-indigo-300 transition-all">
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent resize-none outline-none text-sm p-2 min-h-[44px] max-h-32"
                  rows={1}
                />
                <button 
                  onClick={sendMessage}
                  disabled={!inputText.trim()}
                  className="h-10 w-10 bg-[#5B4FE9] disabled:bg-indigo-300 text-white rounded-xl flex items-center justify-center shrink-0 transition-colors"
                >
                  <Send size={18} className="ml-0.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 bg-stone-50">
            <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
