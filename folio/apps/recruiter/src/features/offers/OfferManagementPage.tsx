import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Mail, 
  MapPin, 
  ArrowRight, 
  X, 
  Sparkles, 
  CheckCircle2, 
  DollarSign, 
  Percent, 
  Award, 
  TrendingUp, 
  Clock, 
  Send,
  AlertCircle
} from 'lucide-react';

// --- Type Declarations ---
export interface CandidateOffer {
  id: string;
  name: string;
  role: string;
  email: string;
  location: string;
  matchScore: number;         // AI Fit Score (e.g., 94%)
  portfolioScore: number;     // Portfolio Intelligence Score (e.g., 87%)
  status: 'Drafting' | 'Awaiting Approval' | 'Sent' | 'Negotiating' | 'Signed';
  statusLabel: string;
  baseSalary: number;
  equity: number;             // percentage (e.g., 0.25)
  signOnBonus: number;
  skills: string[];
  source: string;
  timeline: {
    stage: string;
    date: string;
    completed: boolean;
  }[];
}

interface ToastMessage {
  id: string;
  type: 'success' | 'milestone' | 'ai';
  title: string;
  message: string;
}

// --- Font Style Fallbacks (Folio Space Brand System) ---
const styles = {
  displayFont: { fontFamily: "'DM Serif Display', serif" },
  bodyFont: { fontFamily: "'DM Sans', sans-serif" },
  monoFont: { fontFamily: "'Space Mono', monospace" }
};

export default function OfferManagementPage() {
  const [searchParams] = useSearchParams();
  const queryCandidateId = searchParams.get('candidateId');

  // --- Mock Data ---
  const initialCandidates: CandidateOffer[] = [];

  // --- States ---
  const [candidates, setCandidates] = useState<CandidateOffer[]>(initialCandidates);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sliders values state (synchronized with selected candidate)
  const [baseVal, setBaseVal] = useState(120000);
  const [equityVal, setEquityVal] = useState(0.2);
  const [bonusVal, setBonusVal] = useState(5000);
  const [aiScore, setAiScore] = useState(94);

  const selectedCandidate = candidates.find(c => c.id === selectedId);

  // Handle URL query parameters to auto-select candidate
  useEffect(() => {
    if (queryCandidateId) {
      const match = candidates.find(c => c.id === queryCandidateId);
      if (match) {
        setSelectedId(queryCandidateId);
        setDrawerOpen(true);
      }
    }
  }, [queryCandidateId]);

  // --- Dynamic Slider Math & AI Score Calculation ---
  // Ideal terms calculated dynamically based on candidate's Portfolio Score
  const getIdealTerms = (portfolioScore: number) => {
    const idealBase = Math.round((portfolioScore * 1750) + 10000); // e.g. 87 -> 162.2k
    const idealEquity = Number(((portfolioScore * 0.0035) - 0.05).toFixed(2)); // e.g. 87 -> 0.25%
    const idealBonus = Math.round((portfolioScore * 120) - 2000); // e.g. 87 -> 8.4k
    return { idealBase, idealEquity, idealBonus };
  };

  useEffect(() => {
    if (selectedCandidate) {
      setBaseVal(selectedCandidate.baseSalary);
      setEquityVal(selectedCandidate.equity);
      setBonusVal(selectedCandidate.signOnBonus);
    }
  }, [selectedId]);

  useEffect(() => {
    if (selectedCandidate) {
      const { idealBase, idealEquity } = getIdealTerms(selectedCandidate.portfolioScore);
      
      // Calculate deviation percentage
      const baseDeviation = Math.abs(baseVal - idealBase) / idealBase;
      const equityDeviation = Math.abs(equityVal - idealEquity) / (idealEquity || 0.1);
      
      // AI Alignment Score decreases if parameters deviate significantly from recommended portfolio benchmark
      const calculatedScore = Math.max(30, Math.min(100, Math.round(100 - (baseDeviation * 50 + equityDeviation * 40))));
      setAiScore(calculatedScore);
    }
  }, [baseVal, equityVal, bonusVal, selectedCandidate]);

  // --- Helper: Trigger Toast ---
  const triggerToast = (type: 'success' | 'milestone' | 'ai', title: string, message: string) => {
    const newToast: ToastMessage = {
      id: Date.now().toString(),
      type,
      title,
      message
    };
    setToasts(prev => [...prev, newToast]);
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 5000);
  };

  // --- Sidebar & Drawer Open Action ---
  const handleOpenDrawer = (candidate: CandidateOffer) => {
    setSelectedId(candidate.id);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  // --- Simulation Handlers ---
  const handleSaveTerms = () => {
    if (!selectedCandidate) return;
    
    setCandidates(prev => prev.map(c => {
      if (c.id === selectedCandidate.id) {
        return {
          ...c,
          baseSalary: baseVal,
          equity: equityVal,
          signOnBonus: bonusVal
        };
      }
      return c;
    }));

    triggerToast(
      'ai',
      'Compensation Updated',
      `Modified offer package for ${selectedCandidate.name}. AI alignment index updated to ${aiScore}%.`
    );
  };

  const handleRegenerateAI = () => {
    if (!selectedCandidate) return;
    const { idealBase, idealEquity, idealBonus } = getIdealTerms(selectedCandidate.portfolioScore);
    
    setBaseVal(idealBase);
    setEquityVal(idealEquity);
    setBonusVal(idealBonus);

    triggerToast(
      'ai',
      'AI Recommendation Applied',
      `Optimized offer package for ${selectedCandidate.name} to match portfolio craft strength.`
    );
  };

  const handleApproveAndSend = () => {
    if (!selectedCandidate) return;

    setCandidates(prev => prev.map(c => {
      if (c.id === selectedCandidate.id) {
        const updatedTimeline = [...c.timeline];
        const sentStepIndex = updatedTimeline.findIndex(t => t.stage.toLowerCase().includes('sent'));
        if (sentStepIndex !== -1) {
          updatedTimeline[sentStepIndex] = { stage: 'Offer Sent', date: '20 Jun 2026', completed: true };
        }
        return {
          ...c,
          status: 'Sent' as const,
          statusLabel: 'Awaiting Candidate Signature',
          timeline: updatedTimeline,
          baseSalary: baseVal,
          equity: equityVal,
          signOnBonus: bonusVal
        };
      }
      return c;
    }));

    triggerToast(
      'success',
      'Offer Package Dispatched',
      `Official offer letter containing customized terms sent to ${selectedCandidate.email}.`
    );
    handleCloseDrawer();
  };

  const handleSimulateCounter = () => {
    if (!selectedCandidate) return;
    
    const counterBase = Math.round(baseVal + 8000);
    
    setCandidates(prev => prev.map(c => {
      if (c.id === selectedCandidate.id) {
        const updatedTimeline = [...c.timeline];
        updatedTimeline.push({ stage: `Counter-Offer: $${counterBase.toLocaleString()}`, date: '20 Jun 2026', completed: true });
        return {
          ...c,
          status: 'Negotiating' as const,
          statusLabel: 'Counter-Offer Received',
          timeline: updatedTimeline
        };
      }
      return c;
    }));

    triggerToast(
      'milestone',
      'Milestone: Candidate Counter-Offer',
      `${selectedCandidate.name} proposed an adjustment: requested base salary increase to $${counterBase.toLocaleString()}.`
    );
    handleCloseDrawer();
  };

  const handleSimulateAcceptance = () => {
    if (!selectedCandidate) return;

    setCandidates(prev => prev.map(c => {
      if (c.id === selectedCandidate.id) {
        const updatedTimeline = c.timeline.map(t => ({ ...t, completed: true }));
        if (!updatedTimeline.some(t => t.stage === 'Accepted & Signed')) {
          updatedTimeline.push({ stage: 'Accepted & Signed', date: '20 Jun 2026', completed: true });
        }
        return {
          ...c,
          status: 'Signed' as const,
          statusLabel: 'Offer Signed',
          timeline: updatedTimeline
        };
      }
      return c;
    }));

    triggerToast(
      'success',
      'Candidate Signed',
      `Success! ${selectedCandidate.name} has signed the contract. Triggering automated onboarding workflow.`
    );
    handleCloseDrawer();
  };

  // --- Aggregate Stats ---
  const draftingCount = candidates.filter(c => c.status === 'Drafting' || c.status === 'Awaiting Approval').length;
  const sentCount = candidates.filter(c => c.status === 'Sent' || c.status === 'Negotiating').length;
  const signedCount = candidates.filter(c => c.status === 'Signed').length;

  return (
    <div 
      className="min-h-screen bg-[#F2EFEA] text-[#1A1A2E] p-0 overflow-x-hidden relative"
      style={styles.bodyFont}
    >
      {/* Toast Notification Stack */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-md">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`p-4 rounded-xl border bg-white shadow-xl transition-all duration-300 transform translate-y-0 flex gap-3 items-start
              ${toast.type === 'success' ? 'border-[#00C9A7]' : ''}
              ${toast.type === 'milestone' ? 'border-[#FF6B35]' : ''}
              ${toast.type === 'ai' ? 'border-[#5B4FE9]' : ''}
            `}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#00C9A7] shrink-0 mt-0.5" />}
            {toast.type === 'milestone' && <AlertCircle className="w-5 h-5 text-[#FF6B35] shrink-0 mt-0.5" />}
            {toast.type === 'ai' && <Sparkles className="w-5 h-5 text-[#5B4FE9] shrink-0 mt-0.5" />}
            
            <div className="flex-1">
              <h4 
                className="text-xs font-mono tracking-wider uppercase font-semibold text-slate-500 mb-1"
                style={styles.monoFont}
              >
                {toast.title}
              </h4>
              <p className="text-sm text-[#1A1A2E] leading-relaxed">{toast.message}</p>
            </div>
            
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Header Container */}
      <div className="max-w-[1200px] mx-auto mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 
            className="mb-2 text-[22px] font-bold text-[#1A1C2E]"
            style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
          >
            Offer management
          </h1>
          <p className="max-w-3xl text-[15px] leading-relaxed text-[#1A1C2E99]">
            Draft, negotiate, and finalize compensation structures. Use portfolio intelligence matches to optimize candidate acceptance.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-slate-200 px-4 py-2 rounded-full self-start md:self-auto shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00C9A7] animate-pulse"></div>
          <span className="text-xs font-mono tracking-wider text-slate-600 uppercase" style={styles.monoFont}>
            Live Compensation Sync
          </span>
        </div>
      </div>

      {/* Top Statistic Widgets */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Metric Card 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase" style={styles.monoFont}>
            Offer Queue
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-light text-[#1A1A2E]" style={styles.displayFont}>
              {candidates.filter(c => c.status !== 'Signed').length}
            </span>
            <span className="text-xs text-slate-500 font-sans">active drafts</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Awaiting candidate review</span>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[10px] font-mono tracking-widest text-[#00C9A7] uppercase font-bold" style={styles.monoFont}>
            Acceptance Rate
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-light text-[#00C9A7]" style={styles.displayFont}>
              88%
            </span>
            <span className="text-xs text-slate-500 font-sans">ytd benchmark</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-[#00C9A7]" />
            <span className="text-[#00C9A7]">1.2% above company average</span>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[10px] font-mono tracking-widest text-[#5B4FE9] uppercase font-bold" style={styles.monoFont}>
            AI Compensation Alignment
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-light text-[#5B4FE9]" style={styles.displayFont}>
              94%
            </span>
            <span className="text-xs text-slate-500 font-sans">portfolio precision</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-[#5B4FE9]" />
            <span className="text-[#5B4FE9]">Targeting optimal acceptance range</span>
          </div>
        </div>

      </div>

      {/* Main Board Columns Container */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Column 1: Drafting & Approvals */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-lg font-semibold text-[#1A1A2E] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              Drafts & Approvals
            </h3>
            <span className="bg-slate-200 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold" style={styles.monoFont}>
              {draftingCount}
            </span>
          </div>

          <div className="flex flex-col gap-4 min-h-[500px]">
            {candidates
              .filter(c => c.status === 'Drafting' || c.status === 'Awaiting Approval')
              .map(candidate => (
                <CandidateCard 
                  key={candidate.id} 
                  candidate={candidate} 
                  onClick={() => handleOpenDrawer(candidate)} 
                />
              ))}
            {draftingCount === 0 && <EmptyColumnState />}
          </div>
        </div>

        {/* Column 2: Sent & Negotiating */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-lg font-semibold text-[#1A1A2E] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF6B35]"></span>
              Sent & Negotiating
            </h3>
            <span className="bg-[#FF6B35]/15 text-[#FF6B35] text-xs px-2.5 py-0.5 rounded-full font-mono font-bold" style={styles.monoFont}>
              {sentCount}
            </span>
          </div>

          <div className="flex flex-col gap-4 min-h-[500px]">
            {candidates
              .filter(c => c.status === 'Sent' || c.status === 'Negotiating')
              .map(candidate => (
                <CandidateCard 
                  key={candidate.id} 
                  candidate={candidate} 
                  onClick={() => handleOpenDrawer(candidate)} 
                />
              ))}
            {sentCount === 0 && <EmptyColumnState />}
          </div>
        </div>

        {/* Column 3: Signed & Accepted */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-lg font-semibold text-[#1A1A2E] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C9A7]"></span>
              Signed & Closed
            </h3>
            <span className="bg-[#00C9A7]/15 text-[#00C9A7] text-xs px-2.5 py-0.5 rounded-full font-mono font-bold" style={styles.monoFont}>
              {signedCount}
            </span>
          </div>

          <div className="flex flex-col gap-4 min-h-[500px]">
            {candidates
              .filter(c => c.status === 'Signed')
              .map(candidate => (
                <CandidateCard 
                  key={candidate.id} 
                  candidate={candidate} 
                  onClick={() => handleOpenDrawer(candidate)} 
                />
              ))}
            {signedCount === 0 && <EmptyColumnState />}
          </div>
        </div>

      </div>

      {/* Drawer Overlay Backdrop */}
      {drawerOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-300"
          onClick={handleCloseDrawer}
        />
      )}

      {/* Slide-out Detail Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-[#F8F6F2] shadow-2xl z-50 border-l border-slate-200 transition-transform duration-300 ease-out transform p-6 overflow-y-auto flex flex-col justify-between
          ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {selectedCandidate ? (
          <div>
            {/* Drawer Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-[#5B4FE9] uppercase font-bold" style={styles.monoFont}>
                  Offer Analyzer
                </span>
                <h2 className="text-2xl text-[#1A1A2E] mt-1 font-semibold" style={styles.displayFont}>
                  Compensation Review
                </h2>
              </div>
              <button 
                onClick={handleCloseDrawer}
                className="p-1.5 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Candidate Card Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#A89FD6]/10 flex items-center justify-center text-[#5B4FE9] font-bold text-lg border border-[#A89FD6]/20">
                  {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-base text-[#1A1A2E] leading-snug">{selectedCandidate.name}</h3>
                  <p className="text-xs text-slate-500 leading-snug">{selectedCandidate.role}</p>
                </div>
                <div className="ml-auto bg-[#5B4FE9]/10 text-[#5B4FE9] text-xs font-mono px-2 py-1 rounded font-semibold" style={styles.monoFont}>
                  {selectedCandidate.matchScore}% Match
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedCandidate.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedCandidate.location} • {selectedCandidate.source}</span>
                </div>
              </div>

              {/* Portfolio Intelligence metric matching the screenshot */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-[#5B4FE9] font-mono tracking-wider text-[10px]" style={styles.monoFont}>PORTFOLIO INTELLIGENCE</span>
                  <span className="text-[#5B4FE9] font-mono text-[10px]" style={styles.monoFont}>{selectedCandidate.portfolioScore}%</span>
                </div>
                <div className="w-full bg-[#5B4FE9]/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#5B4FE9] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${selectedCandidate.portfolioScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI Compensation Assistant Container */}
            <div className="bg-[#5B4FE9]/5 border border-[#5B4FE9]/15 rounded-2xl p-5 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20">
                <Sparkles className="w-20 h-20 text-[#5B4FE9]" />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#5B4FE9]" />
                <h4 className="text-xs font-mono font-bold tracking-wider text-[#5B4FE9] uppercase" style={styles.monoFont}>
                  Folio AI Assistant
                </h4>
              </div>

              {/* Dynamic AI Alignment Score */}
              <div className="flex items-center justify-between bg-white/70 border border-[#5B4FE9]/10 px-4 py-3 rounded-xl mb-4 shadow-sm">
                <div>
                  <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase" style={styles.monoFont}>AI Alignment Index</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">Calculated acceptance likelihood</p>
                </div>
                <div className="text-right">
                  <span 
                    className={`text-2xl font-bold font-mono transition-colors
                      ${aiScore >= 85 ? 'text-[#00C9A7]' : ''}
                      ${aiScore < 85 && aiScore >= 70 ? 'text-[#FF6B35]' : ''}
                      ${aiScore < 70 ? 'text-rose-500' : ''}
                    `}
                    style={styles.monoFont}
                  >
                    {aiScore}%
                  </span>
                </div>
              </div>

              {/* Salary Sliders */}
              <div className="flex flex-col gap-4">
                {/* Base Salary */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-[#1A1A2E]">
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-slate-400" /> Base Salary</span>
                    <span className="font-mono text-sm">${baseVal.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min={Math.round(getIdealTerms(selectedCandidate.portfolioScore).idealBase * 0.7)}
                    max={Math.round(getIdealTerms(selectedCandidate.portfolioScore).idealBase * 1.3)}
                    step={1000}
                    value={baseVal}
                    onChange={(e) => setBaseVal(Number(e.target.value))}
                    className="w-full accent-[#5B4FE9] bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1" style={styles.monoFont}>
                    <span>Min Rec: ${(getIdealTerms(selectedCandidate.portfolioScore).idealBase * 0.9 / 1000).toFixed(0)}k</span>
                    <span className="text-[#5B4FE9] font-bold">Ideal: ${(getIdealTerms(selectedCandidate.portfolioScore).idealBase / 1000).toFixed(0)}k</span>
                    <span>Max Rec: ${(getIdealTerms(selectedCandidate.portfolioScore).idealBase * 1.1 / 1000).toFixed(0)}k</span>
                  </div>
                </div>

                {/* Equity */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-[#1A1A2E]">
                    <span className="flex items-center gap-1"><Percent className="w-3.5 h-3.5 text-slate-400" /> Equity Grant</span>
                    <span className="font-mono text-sm">{equityVal}%</span>
                  </div>
                  <input 
                    type="range" 
                    min={Math.max(0.01, getIdealTerms(selectedCandidate.portfolioScore).idealEquity - 0.15)}
                    max={getIdealTerms(selectedCandidate.portfolioScore).idealEquity + 0.15}
                    step={0.01}
                    value={equityVal}
                    onChange={(e) => setEquityVal(Number(Number(e.target.value).toFixed(2)))}
                    className="w-full accent-[#5B4FE9] bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Sign-on Bonus */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-[#1A1A2E]">
                    <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-slate-400" /> Sign-On Bonus</span>
                    <span className="font-mono text-sm">${bonusVal.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min={0}
                    max={25000}
                    step={1000}
                    value={bonusVal}
                    onChange={(e) => setBonusVal(Number(e.target.value))}
                    className="w-full accent-[#5B4FE9] bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Utility actions inside the AI section */}
              <div className="mt-5 pt-4 border-t border-[#5B4FE9]/10 flex gap-2 justify-end">
                <button 
                  onClick={handleRegenerateAI}
                  className="px-3 py-1.5 bg-[#5B4FE9] hover:bg-[#4a3ec8] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Optimize Terms
                </button>
                <button 
                  onClick={handleSaveTerms}
                  className="px-3 py-1.5 border border-[#5B4FE9]/30 hover:border-[#5B4FE9] text-[#5B4FE9] rounded-lg text-xs font-medium transition-colors"
                >
                  Save Draft
                </button>
              </div>
            </div>

            {/* Offer Timeline / Logs */}
            <div className="mb-6">
              <h4 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-3" style={styles.monoFont}>
                Offer Timeline Log
              </h4>
              <div className="flex flex-col gap-3">
                {selectedCandidate.timeline.map((step, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="flex flex-col items-center shrink-0 mt-0.5">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center
                        ${step.completed ? 'border-[#00C9A7] bg-[#00C9A7]' : 'border-slate-300 bg-white'}
                      `}>
                        {step.completed && <div className="w-1 h-1 bg-white rounded-full" />}
                      </div>
                      {idx < selectedCandidate.timeline.length - 1 && (
                        <div className={`w-0.5 h-8 my-0.5
                          ${step.completed && selectedCandidate.timeline[idx + 1].completed ? 'bg-[#00C9A7]' : 'bg-slate-200'}
                        `} />
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold leading-none
                        ${step.completed ? 'text-[#1A1A2E]' : 'text-slate-400'}
                      `}>
                        {step.stage}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-none font-mono" style={styles.monoFont}>
                        {step.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Drawer Sticky Bottom Actions */}
        {selectedCandidate ? (
          <div className="pt-4 border-t border-slate-200 flex flex-col gap-2.5 mt-auto">
            {/* Primary dispatch option */}
            {selectedCandidate.status !== 'Signed' && (
              <button 
                onClick={handleApproveAndSend}
                className="w-full bg-[#5B4FE9] hover:bg-[#4a3ec8] text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                Approve & Dispatch Offer
              </button>
            )}

            {/* Simulations (Recruiter Helper Actions) */}
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-3">
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold" style={styles.monoFont}>
                Recruiter Simulation Toolbox
              </span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button 
                  onClick={handleSimulateCounter}
                  disabled={selectedCandidate.status === 'Signed'}
                  className="bg-white border border-slate-200 hover:border-[#FF6B35] hover:text-[#FF6B35] disabled:opacity-50 text-slate-600 text-xs py-2 px-2.5 rounded-lg font-medium transition-all text-center leading-snug"
                >
                  Simulate Counter
                </button>
                <button 
                  onClick={handleSimulateAcceptance}
                  disabled={selectedCandidate.status === 'Signed'}
                  className="bg-white border border-slate-200 hover:border-[#00C9A7] hover:text-[#00C9A7] disabled:opacity-50 text-slate-600 text-xs py-2 px-2.5 rounded-lg font-medium transition-all text-center leading-snug"
                >
                  Simulate Signature
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// --- Candidate Sub-Component ---
function CandidateCard({ candidate, onClick }: { candidate: CandidateOffer; onClick: () => void }) {
  // Styles depending on state
  const getBadgeStyles = (status: string) => {
    switch (status) {
      case 'Drafting':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'Awaiting Approval':
        return 'bg-[#A89FD6]/10 text-[#5B4FE9] border border-[#A89FD6]/20';
      case 'Sent':
        return 'bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20';
      case 'Negotiating':
        return 'bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30 font-bold';
      case 'Signed':
        return 'bg-[#00C9A7]/10 text-[#00C9A7] border border-[#00C9A7]/20';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div 
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-150 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
      onClick={onClick}
    >
      <div>
        {/* Card Header */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A1A2E]/5 border border-slate-100 flex items-center justify-center font-bold text-sm text-[#1A1A2E]">
              {candidate.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1A1A2E] leading-snug group-hover:text-[#5B4FE9] transition-colors">{candidate.name}</h4>
              <p className="text-xs text-slate-400 font-sans leading-snug mt-0.5">{candidate.role}</p>
            </div>
          </div>
          <span 
            className="text-[10px] font-mono bg-[#5B4FE9]/10 text-[#5B4FE9] px-1.5 py-0.5 rounded font-semibold shrink-0"
            style={styles.monoFont}
          >
            {candidate.matchScore}%
          </span>
        </div>

        {/* Contact info & Location */}
        <div className="flex flex-col gap-1.5 mb-4 text-slate-500 text-xs">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-300" />
            <span className="truncate">{candidate.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-300" />
            <span>{candidate.location}</span>
          </div>
        </div>

        {/* Portfolio Intelligence progress bar matching the pipeline cards */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-[9px] font-semibold mb-1 font-mono" style={styles.monoFont}>
            <span className="text-[#A89FD6] tracking-wider uppercase">PORTFOLIO INTELLIGENCE</span>
            <span className="text-[#5B4FE9]">{candidate.portfolioScore}%</span>
          </div>
          <div className="w-full bg-[#5B4FE9]/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#5B4FE9] h-full rounded-full" style={{ width: `${candidate.portfolioScore}%` }} />
          </div>
        </div>

        {/* Skill tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {candidate.skills.slice(0, 3).map((skill, index) => (
            <span 
              key={index} 
              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-medium transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Compensation Summary & Stage badge */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-col">
          <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest" style={styles.monoFont}>
            Package Structure
          </span>
          <span className="text-xs font-mono font-bold text-[#1A1A2E] mt-0.5" style={styles.monoFont}>
            ${(candidate.baseSalary / 1000).toFixed(0)}k • {candidate.equity}% • ${(candidate.signOnBonus / 1000).toFixed(0)}k
          </span>
        </div>
        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${getBadgeStyles(candidate.status)}`}>
          {candidate.statusLabel}
        </span>
      </div>

      {/* Hover visual cue arrow */}
      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 border border-slate-200">
        <ArrowRight className="w-3.5 h-3.5 text-[#5B4FE9]" />
      </div>
    </div>
  );
}

// --- Empty Stage Helper Component ---
function EmptyColumnState() {
  return (
    <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400 min-h-[150px]">
      <p className="text-xs font-semibold">No candidates in this stage</p>
      <p className="text-[10px] mt-1 leading-snug">Drag and drop or select to adjust offer status.</p>
    </div>
  );
}
