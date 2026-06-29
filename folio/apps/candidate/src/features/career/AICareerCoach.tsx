import { Bot, Gauge, MessageSquareText, Sparkles, Send } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export interface CareerCoachMessage {
  role: 'candidate' | 'coach';
  content: string;
}

export interface CareerReadinessScoreProps {
  score: number;
  signals: string[];
}

export function AICareerCoach() {
  return (
    <div className="page max-w-6xl animate-slide-up">
      <div className="mb-10">
        <span className="page-label">Intelligence</span>
        <h1 className="page-title">AI career coach</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <Card variant="dark" className="lg:col-span-2 flex flex-col min-h-[500px]">
          <div className="mb-6 flex items-center gap-3 border-b border-navy-700 pb-4">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-h2">Chat-style guidance</h2>
          </div>
          <div className="flex-1 flex flex-col justify-end space-y-4">
            <div className="max-w-[80%] rounded-2xl rounded-tl-none bg-navy-800 p-4 border border-navy-700">
              <p className="text-sm text-lavender-100 font-sans leading-relaxed">
                Your Product Design Intern match is strong at 82%. To reach the top 10% of applicants, add one case study section detailing your research synthesis process for the FinTech project.
              </p>
            </div>
            <div className="max-w-[80%] self-end rounded-2xl rounded-tr-none bg-indigo p-4">
              <p className="text-sm text-white font-sans leading-relaxed">
                What tools should I mention in that section?
              </p>
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-tl-none bg-navy-800 p-4 border border-navy-700">
              <p className="text-sm text-lavender-100 font-sans leading-relaxed">
                Highlight your use of Dovetail or UserTesting.com if you used them, as 60% of top roles require these specific tools.
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <input 
              className="flex-1 rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 text-sm text-white placeholder-navy-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Ask about your portfolio, interviews, or next steps..."
            />
            <Button size="lg" className="px-3">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
        
        <div className="flex flex-col gap-8">
          <Card variant="dark">
            <div className="flex items-center gap-3 mb-6">
              <Gauge className="h-5 w-5 text-mint-400" />
              <h2 className="text-h2">Readiness score</h2>
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative flex items-center justify-center">
                <svg className="h-32 w-32 -rotate-90 transform">
                  <circle
                    cx="64"
                    cy="64"
                    r="48"
                    className="stroke-navy-700 fill-none"
                    strokeWidth="10"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="48"
                    className="stroke-mint fill-none drop-shadow-[0_0_8px_rgba(29,209,161,0.5)]"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - 0.82)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-serif text-white">82<span className="text-lg text-mint-400">%</span></span>
                </div>
              </div>
              <p className="mt-6 text-center text-sm font-sans text-lavender-300">
                You are highly competitive for Junior Product Design roles.
              </p>
            </div>
          </Card>
          
          <Card variant="dark">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquareText className="h-5 w-5 text-orange-400" />
              <h2 className="text-h2">Interview prep</h2>
            </div>
            <p className="text-sm font-sans text-lavender-300 leading-relaxed">
              We've generated 5 mock behavioral questions based on your latest application. Ready to practice?
            </p>
            <Button variant="secondary" className="w-full mt-6">Start practice</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

