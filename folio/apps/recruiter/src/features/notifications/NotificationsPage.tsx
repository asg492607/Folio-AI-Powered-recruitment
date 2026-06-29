import { BellRing, Mail, MessageSquare, Send } from 'lucide-react';
import { useCollection } from '@/hooks/useCollection';
import type { NotificationItem } from '@/types';

export default function NotificationsPage() {
  const { items: notifications, updateItem } = useCollection<NotificationItem>('notifications');

  const formatDateTime = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return iso.replace('T', ' ');
    }
  };

  // Sample static channel analytics to support visual richness
  const channelStats = {
    Email: { success: '98.4%', engagement: '74.2%' },
    Slack: { success: '100.0%', engagement: '92.8%' },
    'In-app': { success: '100.0%', engagement: '48.6%' },
  };

  return (
    /* FIXED: Removed max-w-5xl and changed to w-full to utilize the whole browser window */
    <div className="space-y-6 w-full">
      {/* Main Content Grid: Expanded columns to fit wide view environments comfortably */}
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        
        {/* Left Column: Message Mix */}
        <section className="rounded-2xl border border-[#ECE8E2] bg-[#FCFBF9] p-6 h-fit shadow-sm">
          <div className="mb-5 border-b border-[#ECE8E2] pb-4">
            <h2 className="mb-2 text-[22px] font-bold text-[#1A1C2E]"
          style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>Message Mix</h2>
            <p className="mt-1 text-[10px] text-[#6D6B8D] uppercase font-mono tracking-wider font-bold">Templates by delivery channel.</p>
          </div>
          
          <div className="space-y-4">
            {(['Email', 'Slack', 'In-app'] as NotificationItem['channel'][]).map((channel) => {
              const stats = channelStats[channel as keyof typeof channelStats] || { success: '100%', engagement: '50%' };
              return (
                <div key={channel} className="rounded-xl border border-[#ECE8E2] bg-white p-5 transition duration-150 hover:border-brand-purple/20 hover:shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-purple/5 text-brand-purple border border-brand-purple/10">
                        {channel === 'Email' ? (
                          <Mail className="h-4 w-4" strokeWidth={1.5} />
                        ) : channel === 'Slack' ? (
                          <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
                        ) : (
                          <BellRing className="h-4 w-4" strokeWidth={1.5} />
                        )}
                      </div>
                      <span className="text-xs font-bold uppercase font-mono tracking-wider text-brand-navy">{channel}</span>
                    </div>
                    <div className="font-serif text-2xl text-brand-navy font-normal">
                      {notifications.filter((item) => item.channel === channel).length} <span className="text-xs text-stone-400 font-sans">templates</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-stone-400">Delivery Rate</div>
                      <div className="text-brand-mint font-semibold mt-0.5">{stats.success}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-stone-400">Engagement</div>
                      <div className="text-brand-purple font-semibold mt-0.5">{stats.engagement}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Metrics & Queue Layout */}
        <section className="space-y-6">
          {/* Compact Metrics Strip */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Sent Today */}
            <div className="p-5 rounded-2xl border border-[#ECE8E2] bg-white flex flex-col justify-between min-h-[115px] transition duration-150 hover:border-brand-purple/20 shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-[10px] text-[#6D6B8D] uppercase font-mono tracking-wider font-bold">
                  Sent
                </span>
                <Send className="h-4 w-4 text-brand-mint" strokeWidth={1.5} />
              </div>
              <div className="mt-2">
                <div className="font-serif text-3xl font-normal text-brand-mint leading-none">
                  {notifications.filter((item) => item.status === 'Sent').length}
                </div>
                <p className="text-[10px] text-stone-400 font-sans mt-1">completed actions</p>
              </div>
            </div>

            {/* Scheduled */}
            <div className="p-5 rounded-2xl border border-[#ECE8E2] bg-white flex flex-col justify-between min-h-[115px] transition duration-150 hover:border-brand-purple/20 shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-[10px] text-[#6D6B8D] uppercase font-mono tracking-wider font-bold">
                  Scheduled
                </span>
                <BellRing className="h-4 w-4 text-brand-orange" strokeWidth={1.5} />
              </div>
              <div className="mt-2">
                <div className="font-serif text-3xl font-normal text-brand-orange leading-none">
                  {notifications.filter((item) => item.status === 'Scheduled').length}
                </div>
                <p className="text-[10px] text-stone-400 font-sans mt-1">active triggers</p>
              </div>
            </div>

            {/* Pending Drafts */}
            <div className="p-5 rounded-2xl border border-[#ECE8E2] bg-white flex flex-col justify-between min-h-[115px] transition duration-150 hover:border-brand-purple/20 shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-[10px] text-[#6D6B8D] uppercase font-mono tracking-wider font-bold">
                  Drafts
                </span>
                <Mail className="h-4 w-4 text-brand-navy opacity-80" strokeWidth={1.5} />
              </div>
              <div className="mt-2">
                <div className="font-serif text-3xl font-normal text-brand-navy leading-none">
                  {notifications.filter((item) => item.status === 'Draft').length}
                </div>
                <p className="text-[10px] text-stone-400 font-sans mt-1">awaiting review</p>
              </div>
            </div>
          </div>

          {/* Queue List */}
          <div className="rounded-2xl border border-[#ECE8E2] bg-[#FCFBF9] p-6 shadow-sm">
            <div className="mb-5 border-b border-[#ECE8E2] pb-4">
              <h2 className="mb-2 text-[22px] font-bold text-[#1A1C2E]"
          style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>Notification Queue</h2>
              <p className="mt-1 text-[10px] text-[#6D6B8D] uppercase font-mono tracking-wider font-bold">Lifecycle actions of active notifications.</p>
            </div>
            
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-[#ECE8E2] rounded-2xl bg-stone-50/50">
                  <BellRing className="h-10 w-10 text-stone-400 mb-3" strokeWidth={1.5} />
                  <h3 className="font-sans font-semibold text-sm text-brand-navy">No pending notifications</h3>
                  <p className="mt-1 text-xs text-[#6D6B8D] max-w-xs">All outbound campaign queues are currently empty and synced.</p>
                </div>
              ) : (
                notifications.map((item) => {
                  const statusColor = 
                    item.status === 'Draft'
                      ? 'bg-stone-400'
                      : item.status === 'Scheduled'
                      ? 'bg-brand-orange'
                      : 'bg-brand-mint';

                  return (
                    <article key={item.id} className="p-5 rounded-xl border border-[#ECE8E2] bg-white transition duration-150 hover:border-brand-purple/20 hover:shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1 min-w-[240px]">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-sans font-semibold text-brand-navy leading-tight">
                              {item.title}
                            </h3>
                            <span className="flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${statusColor}`} />
                              <span className="text-[9px] text-[#6D6B8D] uppercase font-mono font-bold">
                                {item.status}
                              </span>
                            </span>
                          </div>
                          <p className="mt-2 text-[#6D6B8D] font-sans text-xs leading-relaxed w-full">
                            {item.detail}
                          </p>
                        </div>
                        
                        {/* Selector control */}
                        <div className="flex-shrink-0">
                          <select 
                            className="input bg-white border border-[#ECE8E2] py-1.5 px-3 text-[10px] font-bold font-mono uppercase cursor-pointer min-w-[120px] rounded-lg focus:outline-none focus:border-brand-purple/40" 
                            value={item.status} 
                            onChange={(event) => void updateItem(item.id, { status: event.target.value as NotificationItem['status'] })}
                          >
                            <option>Draft</option>
                            <option>Scheduled</option>
                            <option>Sent</option>
                          </select>
                        </div>
                      </div>

                      {/* Metadata strip: Optimized grid widths to breathe neatly on maximized screens */}
                      <div className="mt-5 pt-4 border-t border-[#ECE8E2]/60 grid gap-4 items-center grid-cols-2 sm:grid-cols-[1.2fr_1.2fr_1.2fr_auto] text-xs">
                        <QueueInfo label="Channel" value={item.channel} />
                        <QueueInfo label="Audience" value={item.audience} />
                        <QueueInfo label="Send at" value={formatDateTime(item.sendAt)} />
                        <div className="flex justify-end col-span-2 sm:col-span-1 pt-2 sm:pt-0">
                          <button 
                            className="text-[10px] font-bold font-mono uppercase tracking-wider text-white bg-brand-purple hover:bg-brand-orange px-4 py-2.5 rounded-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shadow-sm" 
                            type="button" 
                            onClick={() => void updateItem(item.id, { status: 'Sent' })}
                          >
                            <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
                            Send Now
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function QueueInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase font-mono text-[#6D6B8D] font-bold tracking-wider">{label}</div>
      {/* FIXED: Removed max-w restricts on label content parameters to fully scale text elements */}
      <div className="mt-0.5 font-mono text-[11px] font-bold text-brand-navy truncate">{value}</div>
    </div>
  );
}