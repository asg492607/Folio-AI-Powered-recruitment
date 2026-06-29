import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';
import { useCandidateStore } from '../../store/candidateStore';

const API_BASE = import.meta.env.VITE_API_URL || '';
const CHATS_URL = `${API_BASE}/api/collections/chats`;

interface ChatMessage {
  id: string;
  applicationId: string;
  senderRole: 'candidate' | 'recruiter';
  text: string;
  timestamp: string;
  senderName: string;
}

export function ApplicationChat({ applicationId }: { applicationId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const candidate = useCandidateStore((state) => state.candidate);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchMessages = async () => {
      try {
        const res = await axios.get(CHATS_URL);
        if (res.data && isMounted) {
          const appMessages = res.data
            .filter((m: ChatMessage) => m.applicationId === applicationId)
            .sort((a: ChatMessage, b: ChatMessage) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          setMessages(appMessages);
          setIsLoading(false);
        }
      } catch (e) {
        console.error('Failed to fetch messages', e);
      }
    };
    
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [applicationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      applicationId,
      senderRole: 'candidate',
      text: inputText,
      timestamp: new Date().toISOString(),
      senderName: candidate?.personalInfo?.name || 'Candidate',
    };
    
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    
    try {
      await axios.post(CHATS_URL, newMsg);
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white border border-[#ECE8E2] rounded-2xl overflow-hidden mt-6 shadow-sm">
      <div className="p-4 border-b border-[#ECE8E2] bg-stone-50">
        <h3 className="font-semibold text-navy">Messages</h3>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && messages.length === 0 ? (
          <div className="text-center text-stone-400 text-sm py-4">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-stone-400 text-sm py-4">No messages yet. Send one to start chatting!</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.senderRole === 'candidate' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.senderRole === 'candidate' ? 'bg-[#ffedd5] text-[#ea580c]' : 'bg-stone-100 text-stone-800'}`}>
                <div className="font-bold text-[10px] uppercase mb-1 opacity-60 tracking-wider">
                  {m.senderRole === 'candidate' ? 'You' : 'Recruiter'}
                </div>
                <div className="leading-relaxed">{m.text}</div>
                <div className="text-[9px] opacity-50 mt-1 text-right">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-[#ECE8E2] bg-white flex gap-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 input rounded-xl py-2 px-3 text-sm border border-stone-200 outline-none focus:border-[#ea580c]"
        />
        <button onClick={sendMessage} className="bg-[#ea580c] text-white rounded-xl px-4 py-2 flex items-center justify-center hover:bg-orange-600 transition-colors">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
