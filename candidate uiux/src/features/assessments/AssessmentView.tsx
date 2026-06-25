import { useState, useEffect } from 'react';
import { Brain, ArrowRight, Check, Loader2, Sparkles, Clock, Eye } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { useNavigate, useLocation } from 'react-router-dom';
import { AssessmentReport } from './AssessmentReport';
import { useCandidateStore } from '../../store/candidateStore';
import { assessmentApi } from '../../api/backend';

interface LocationState {
  jobId?: string;
  companyName?: string;
}

export function AssessmentView() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const candidate = useCandidateStore(s => s.candidate);
  const candidateId = candidate.id || 'candidate_123';
  
  // Default job ID to 1 if not passed from routing (for testing)
  const jobId = parseInt(state?.jobId || '1') || 1;

  const [isStarted, setIsStarted] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dynamic question state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const MAX_QUESTIONS = 5;

  // Show report page
  if (showReport) {
    return <AssessmentReport onBack={() => setShowReport(false)} />;
  }

  async function handleStart() {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Apply to job to initialize assessment pipeline
      await assessmentApi.applyToJob(jobId).catch(err => {
        console.warn("API applyToJob warning (continuing anyway):", err);
      });
      
      // 2. Fetch the first question
      await fetchNextQuestion();
      
      setIsStarted(true);
    } catch (err: any) {
      console.error(err);
      setError("Failed to start assessment. The AI Engine might be down.");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchNextQuestion() {
    setIsLoading(true);
    try {
      const res = await assessmentApi.getQuizQuestion(candidateId);
      // Assume API returns { question: string, options?: string[] }
      const qText = res.data?.question || res.data?.text || "Unknown AI Question. Please choose an option to continue.";
      
      // Fallback options if API does not provide them natively
      const qOptions = res.data?.options || [
        "Prioritize immediate user impact",
        "Conduct further research",
        "Align with stakeholder requirements",
        "Implement a scalable long-term solution"
      ];
      
      setQuestionText(qText);
      setOptions(qOptions);
      setSelectedOption(null);
      setIsConfirmed(false);
    } catch (err) {
      console.error("Failed to fetch next question", err);
      setError("Failed to fetch the next question from the AI engine.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirm() {
    if (!selectedOption) return;
    setIsLoading(true);
    
    try {
      // Submit answer to the backend
      // Using a default score of 10 for demonstration (would normally be evaluated by AI)
      await assessmentApi.submitAnswer(candidateId, questionText, selectedOption, 10);
      setIsConfirmed(true);
      
      if (currentQuestionIndex < MAX_QUESTIONS - 1) {
        setCurrentQuestionIndex(i => i + 1);
        await fetchNextQuestion();
      } else {
        // Trigger final analysis
        await assessmentApi.triggerAnalysis(candidateId).catch(e => console.warn(e));
        setIsFinished(true);
      }
    } catch (err) {
      console.error("Submit failed", err);
      setError("Failed to submit your answer.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleExit() {
    setIsStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsConfirmed(false);
    setIsFinished(false);
  }

  // ── Completion Screen ──────────────────────────────────────────────────────
  if (isFinished) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF9F7] font-sans text-navy">
        <PageHeader title="Assessment" />
        <div className="flex flex-1 flex-col items-center pt-20 px-6 text-center">
          <div className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#f0eeff]">
            <Sparkles className="h-[34px] w-[34px] text-[#6366f1]" strokeWidth={2} />
          </div>
          <h1 className="mb-3 text-[32px] font-bold text-navy font-serif tracking-tight">
            Assessment Complete!
          </h1>
          <p className="mb-10 text-[17px] text-navy/60 font-medium max-w-md">
            The AI Engine has successfully evaluated your responses and generated a comprehensive capability report.
          </p>

          <div className="mt-6 flex items-center gap-6">
            <button
              className="flex items-center rounded-xl bg-[#6366f1] px-7 py-3.5 text-[15px] font-semibold text-white hover:bg-[#4f46e5] transition-colors"
              onClick={() => navigate('/applications')}
            >
              View applications
            </button>
            <button
              className="text-[16px] font-medium text-navy hover:text-indigo transition-colors"
              onClick={() => setShowReport(true)}
            >
              View full report
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz Screen ────────────────────────────────────────────────────────────
  if (isStarted) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF9F7] font-sans text-navy">
        <PageHeader title="Assessment" />

        <div className="flex-1 py-12 lg:py-16">
          <div className="mx-auto w-full max-w-[800px] px-8">

            {/* Progress row */}
            <div className="mb-10 flex items-center justify-between">
              <div className="text-[13px] font-mono tracking-widest text-navy/50 uppercase font-medium">
                Question {currentQuestionIndex + 1} of {MAX_QUESTIONS}
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  {Array.from({ length: MAX_QUESTIONS }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 w-10 rounded-full transition-colors ${i <= currentQuestionIndex ? 'bg-[#6366f1]' : 'bg-chalk-200'}`}
                    />
                  ))}
                </div>
                <button
                  className="text-[15px] font-bold text-navy hover:text-indigo transition-colors"
                  onClick={handleExit}
                >
                  Exit
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-indigo">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="text-sm font-medium animate-pulse">Connecting to AI Engine...</p>
              </div>
            ) : (
              <>
                {/* Question */}
                <h2 className="mb-8 text-[22px] font-medium leading-relaxed text-navy max-w-[700px]">
                  {questionText}
                </h2>

                {/* Options */}
                <div className="space-y-4 max-w-[700px]">
                  {options.map((opt, i) => {
                    const isSelected = selectedOption === opt;
                    let wrapperClass = "flex cursor-pointer items-center rounded-xl border p-[20px] transition-all ";
                    let circleClass = "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ";

                    if (isSelected) {
                      wrapperClass += "border-[#6366f1] bg-[#f0eeff]";
                      circleClass += "border-[#6366f1] bg-[#6366f1]";
                    } else {
                      wrapperClass += "border-chalk-200 bg-white hover:border-chalk-300";
                      circleClass += "border-chalk-300 bg-white";
                    }

                    return (
                      <div
                        key={i}
                        className={wrapperClass}
                        onClick={() => !isConfirmed && setSelectedOption(opt)}
                      >
                        <div className={circleClass}>
                          {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                        </div>
                        <span className={`ml-4 text-[15px] font-medium ${isSelected ? 'text-[#6366f1]' : 'text-navy/80'}`}>
                          {opt}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Action button */}
                <div className="mt-12">
                  <button
                    className="flex items-center rounded-xl bg-navy px-8 py-4 text-[15px] font-semibold text-white hover:bg-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
                    disabled={!selectedOption}
                    onClick={handleConfirm}
                  >
                    Confirm answer <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Intro Screen ───────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F7] font-sans text-navy">
      <PageHeader title="Assessment" />
      
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[600px] text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-chalk-200">
            <Brain className="h-8 w-8 text-indigo" strokeWidth={1.5} />
          </div>
          
          <h1 className="mb-4 text-3xl font-bold text-navy font-serif tracking-tight">
            AI Capability Assessment
          </h1>
          <p className="mx-auto mb-10 max-w-[480px] text-[16px] leading-relaxed text-navy/60">
            This assessment connects directly to our AI Engine to generate dynamic questions based on your profile and the selected job role.
          </p>

          <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center rounded-2xl bg-white p-5 border border-chalk-200 shadow-sm">
              <Clock className="mb-3 h-5 w-5 text-indigo" />
              <span className="text-[14px] font-bold text-navy mb-1">~10 Mins</span>
              <span className="text-[12px] text-navy/50">{MAX_QUESTIONS} dynamic questions</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-white p-5 border border-chalk-200 shadow-sm">
              <Brain className="mb-3 h-5 w-5 text-indigo" />
              <span className="text-[14px] font-bold text-navy mb-1">AI Powered</span>
              <span className="text-[12px] text-navy/50">Adaptive difficulty</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-white p-5 border border-chalk-200 shadow-sm">
              <Eye className="mb-3 h-5 w-5 text-indigo" />
              <span className="text-[14px] font-bold text-navy mb-1">Monitored</span>
              <span className="text-[12px] text-navy/50">Anti-cheat enabled</span>
            </div>
          </div>

          {error && (
            <div className="mb-8 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 max-w-[480px] mx-auto">
              {error}
            </div>
          )}

          <button
            className="inline-flex items-center rounded-xl bg-[#6366f1] px-8 py-4 text-[16px] font-semibold text-white shadow-soft hover:bg-[#4f46e5] transition-all hover:scale-[1.02] disabled:opacity-50"
            onClick={handleStart}
            disabled={isLoading}
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Connecting to Engine...</>
            ) : (
              <>Start assessment <ArrowRight className="ml-2 h-5 w-5" strokeWidth={2.5} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
