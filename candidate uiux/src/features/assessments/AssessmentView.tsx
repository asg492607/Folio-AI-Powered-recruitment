import { useState } from 'react';
import { Brain, Clock, Eye, CheckCircle2, ArrowRight, Sparkles, Check } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { AssessmentReport } from './AssessmentReport';

interface Question {
  id: number;
  text: string;
  options: { id: number; text: string; isCorrect: boolean }[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "A user reports that the checkout flow feels confusing. You have 2 days before the next release. What do you do first?",
    options: [
      { id: 1, text: "Redesign the checkout flow from scratch based on best practices", isCorrect: false },
      { id: 2, text: "Watch 3 session recordings to identify where users drop off", isCorrect: true },
      { id: 3, text: "Run a quick 15-minute usability test with 2 colleagues", isCorrect: false },
      { id: 4, text: "Ask the PM to delay the release until a full research sprint is done", isCorrect: false },
    ],
  },
  {
    id: 2,
    text: "You're designing a complex dashboard with 12 data types. Your first approach is to:",
    options: [
      { id: 1, text: "Create a detailed high-fidelity mockup showing all 12 data types", isCorrect: false },
      { id: 2, text: "Build a content hierarchy model first, then sketch layout options", isCorrect: true },
      { id: 3, text: "Benchmark 5 existing dashboard products and pick the best pattern", isCorrect: false },
      { id: 4, text: "Start with mobile layout since it forces prioritization", isCorrect: false },
    ],
  },
  {
    id: 3,
    text: "A stakeholder insists on adding 5 new features to an already busy screen. What's your response?",
    options: [
      { id: 1, text: "Add all features but use progressive disclosure to hide complexity", isCorrect: false },
      { id: 2, text: "Agree and redesign the layout to fit everything", isCorrect: false },
      { id: 3, text: "Facilitate a prioritization exercise with the team based on user impact", isCorrect: true },
      { id: 4, text: "Ship a version with all features and A/B test later", isCorrect: false },
    ],
  },
];

export function AssessmentView() {
  const navigate = useNavigate();
  const [isStarted, setIsStarted] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  // Show report page
  if (showReport) {
    return <AssessmentReport onBack={() => setShowReport(false)} />;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  function handleConfirm() {
    const correct = currentQuestion.options.find((o) => o.isCorrect);
    if (selectedOption === correct?.id) {
      setScore((s) => s + 1);
    }
    setIsConfirmed(true);
  }

  function handleNext() {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setSelectedOption(null);
      setIsConfirmed(false);
    } else {
      setIsFinished(true);
    }
  }

  function handleExit() {
    setIsStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsConfirmed(false);
    setIsFinished(false);
    setScore(0);
  }

  // ── Completion Screen ──────────────────────────────────────────────────────
  if (isFinished) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF9F7] font-sans text-navy">
        <PageHeader title="Assessment" />
        <div className="flex flex-1 flex-col items-center pt-20 px-6 text-center">
          <div className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#f0eeff]">
            <Brain className="h-[34px] w-[34px] text-[#6366f1]" strokeWidth={2} />
          </div>
          <h1 className="mb-3 text-[32px] font-bold text-navy font-serif tracking-tight">
            Assessment complete!
          </h1>
          <p className="mb-10 text-[17px] text-navy/60 font-medium">
            You scored <span className="font-bold text-[#6366f1]">{score} of {totalQuestions}</span> questions correctly.
          </p>

          <div className="w-full max-w-[560px] rounded-2xl border border-chalk-200 bg-white p-8 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] text-left">
            <h3 className="mb-5 text-[16px] font-bold text-navy">Your results</h3>
            <ul className="space-y-4">
              {questions.map((q, i) => {
                const isGood = i < score;
                return (
                  <li key={q.id} className="flex items-start gap-4">
                    <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isGood ? 'bg-[#ecfdf5] border border-[#6ee7b7]' : 'bg-[#fef2f2] border border-[#fca5a5]'}`}>
                      <Check className={`h-3 w-3 ${isGood ? 'text-[#10b981]' : 'text-[#ef4444]'}`} strokeWidth={3} />
                    </div>
                    <p className="text-[14.5px] text-navy/70 font-medium leading-snug">{q.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-10 flex items-center gap-8">
            <button
              className="flex items-center rounded-xl bg-[#6366f1] px-7 py-3.5 text-[15px] font-semibold text-white hover:bg-[#4f46e5] transition-colors"
              onClick={() => navigate('/applications')}
            >
              View applications
            </button>
            <button
              className="text-[16px] font-medium text-navy hover:text-indigo transition-colors"
              onClick={handleExit}
            >
              Retake assessment
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
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  {questions.map((_, i) => (
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

            {/* Question */}
            <h2 className="mb-8 text-[22px] font-medium leading-relaxed text-navy max-w-[700px]">
              {currentQuestion.text}
            </h2>

            {/* Options */}
            <div className="space-y-4 max-w-[700px]">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOption === option.id;
                const showResult = isConfirmed;
                const isCorrectOption = option.isCorrect;

                let wrapperClass = "flex cursor-pointer items-center rounded-xl border p-[20px] transition-all ";
                let circleClass = "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ";

                if (showResult) {
                  if (isSelected && !isCorrectOption) {
                    wrapperClass += "border-[#fca5a5] bg-[#fef2f2]";
                    circleClass += "border-[#fca5a5] bg-transparent";
                  } else if (isCorrectOption) {
                    wrapperClass += "border-[#6ee7b7] bg-[#ecfdf5]";
                    circleClass += "border-[#10b981] bg-transparent";
                  } else {
                    wrapperClass += "border-transparent bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]";
                    circleClass += "border-chalk-300 bg-transparent";
                  }
                } else {
                  if (isSelected) {
                    wrapperClass += "border-[#a5b4fc] bg-[#f5f3ff]";
                    circleClass += "border-[#6366f1] bg-[#6366f1]";
                  } else {
                    wrapperClass += "border-transparent bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:border-chalk-200";
                    circleClass += "border-chalk-300 bg-transparent";
                  }
                }

                return (
                  <div
                    key={option.id}
                    className={wrapperClass}
                    onClick={() => !isConfirmed && setSelectedOption(option.id)}
                  >
                    <div className={circleClass}>
                      {!showResult && isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                      {showResult && isCorrectOption && <Check className="h-3.5 w-3.5 text-[#10b981]" strokeWidth={3} />}
                    </div>
                    <span className="ml-5 text-[15.5px] font-medium text-navy/90">{option.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Action button */}
            <div className="mt-8 h-14">
              {selectedOption !== null && !isConfirmed && (
                <button
                  className="rounded-xl border border-chalk-200 bg-white px-6 py-3.5 text-[15.5px] font-bold text-navy shadow-sm transition-colors hover:bg-chalk-50"
                  onClick={handleConfirm}
                >
                  Confirm answer
                </button>
              )}
              {isConfirmed && (
                <button
                  className="flex items-center rounded-xl bg-[#6366f1] px-6 py-3.5 text-[15.5px] font-medium text-white transition-colors hover:bg-[#4f46e5]"
                  onClick={handleNext}
                >
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <>Next question <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2.5} /></>
                  ) : (
                    <>View results <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2.5} /></>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── Landing Screen ─────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F7] font-sans text-navy">
      <PageHeader title="Assessment" />

      <div className="flex-1 py-12 lg:py-16">
        <div className="mx-auto w-full max-w-[800px] px-8">

          <div className="mb-6 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#f0eeff]">
            <Brain className="h-[28px] w-[28px] text-[#6366f1]" strokeWidth={2} />
          </div>

          <h1 className="mb-5 text-[32px] font-bold text-[#1e1b4b] font-serif tracking-tight">
            Design Intelligence Assessment
          </h1>
          <p className="mb-10 text-[17.5px] leading-relaxed text-navy/60 font-medium max-w-[650px]">
            This assessment measures 8 dimensions of design competency: design thinking, visual craft, systems thinking, user empathy, technical depth, communication, problem framing, and iteration quality.
          </p>

          <div className="mb-8 w-full rounded-2xl border border-chalk-200 bg-white p-7 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-[18px] w-[18px] text-navy/50" strokeWidth={2} />
                <p className="text-[15.5px] text-navy/60">
                  <span className="font-bold text-navy">Duration:</span> 25–35 minutes
                </p>
              </li>
              <li className="flex items-start gap-3">
                <Brain className="mt-0.5 h-[18px] w-[18px] text-navy/50" strokeWidth={2} />
                <p className="text-[15.5px] text-navy/60">
                  <span className="font-bold text-navy">Format:</span> Adaptive multi-choice + 2 short responses
                </p>
              </li>
              <li className="flex items-start gap-3">
                <Eye className="mt-0.5 h-[18px] w-[18px] text-navy/50" strokeWidth={2} />
                <p className="text-[15.5px] text-navy/60">
                  <span className="font-bold text-navy">Results:</span> Full report visible to you first. Shared with recruiters only if you approve.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] text-navy/50" strokeWidth={2} />
                <p className="text-[15.5px] text-navy/60">
                  <span className="font-bold text-navy">Retake policy:</span> Retakeable after 7 days. Previous results are preserved.
                </p>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-6">
              <button
                className="flex items-center rounded-xl bg-[#6366f1] px-6 py-3.5 text-[15.5px] font-semibold text-white transition-colors hover:bg-[#4f46e5]"
                onClick={() => setIsStarted(true)}
              >
                Start assessment <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2.5} />
              </button>
              <button className="text-[16px] font-medium text-navy transition-colors hover:text-indigo"
                onClick={() => setShowReport(true)}
              >
                View previous report
              </button>
            </div>
            <button className="flex items-center rounded-xl border border-chalk-200 bg-white px-5 py-3 text-[15px] font-bold text-navy shadow-sm transition-colors hover:bg-chalk-50">
              <Sparkles className="mr-2 h-[18px] w-[18px] text-navy" strokeWidth={2.5} />
              AI career coach
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
