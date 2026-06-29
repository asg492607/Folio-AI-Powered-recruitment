import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseApp } from '@/services/firebase/app';
import { db } from '@/services/firebase/db';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const success = await login(email, password, 'Recruiter');
        if (!success) {
          setError('Invalid email or password.');
          setLoading(false);
          return;
        }
        navigate('/');
      } else {
        if (!firebaseApp) throw new Error("Firebase not configured");
        const auth = getAuth(firebaseApp);
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await db.collection('recruiterProfiles').addDoc({
          userId: cred.user.uid,
          email: cred.user.email,
          role: 'Recruiter',
          name: name || email.split('@')[0],
          company: 'Folio'
        });
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-bg px-4 py-12 font-sans">
      <div className="mb-10 text-center animate-slide-up">
        <div className="mb-6 flex justify-center">
          <Link to="/" className="flex items-center gap-2.5 text-decoration-none">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-brand-purple">
              <span className="absolute h-2.5 w-2.5 rounded-full bg-brand-purple opacity-25" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
            </span>
            <span className="font-serif text-2xl tracking-tight text-brand-navy">Folio</span>
          </Link>
        </div>
        <h1 className="text-[32px] font-medium tracking-tight text-brand-navy mb-2">
          {isLogin ? 'Log in' : 'Create your account'}
        </h1>
        <p className="text-brand-navy/60 font-sans text-[15px] leading-relaxed max-w-sm mx-auto">
          {isLogin ? 'Enter your recruiter workspace.' : 'Workspace authentication'}
        </p>
      </div>

      <div className="w-full max-w-[440px] rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <form className="space-y-5" onSubmit={handleAuth}>
          
          <div>
            <label className="mb-2 block font-sans text-sm font-medium text-brand-navy">I am a</label>
            <div className="flex rounded-lg border border-slate-200 bg-white p-1">
              <button
                type="button"
                className="flex-1 rounded-md py-2 text-sm font-medium transition-colors text-brand-navy/70 hover:text-brand-navy"
                onClick={() => window.location.href = '/signup'}
              >
                Design candidate
              </button>
              <button
                type="button"
                className="flex-1 rounded-md py-2 text-sm font-medium transition-colors bg-brand-navy text-white"
              >
                Recruiter / Hiring
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-medium mb-1.5">
                Full name
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={(event) => setName(event.target.value)} 
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-[15px] text-brand-navy transition-colors focus:border-brand-purple focus:bg-white focus:outline-none" 
                placeholder="Avni Sharma"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-medium mb-1.5">
              Email
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={(event) => setEmail(event.target.value)} 
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-[15px] text-brand-navy transition-colors focus:border-brand-purple focus:bg-white focus:outline-none" 
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-medium mb-1.5">
              Password
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={(event) => setPassword(event.target.value)} 
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-[15px] text-brand-navy transition-colors focus:border-brand-purple focus:bg-white focus:outline-none" 
              placeholder="8+ characters"
              required
            />
          </div>

          {error && (
            <p className="mt-1.5 text-xs font-medium text-orange-600">{error}</p>
          )}

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-lg bg-brand-purple px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-purple/90 disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Log in' : 'Create account'}
            </button>
            
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="mx-4 text-sm text-brand-navy/40">or</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>

            <button
              className="w-full flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-slate-50"
              type="button"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Continue with Google
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-brand-navy/60">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            className="font-medium text-brand-purple hover:text-brand-purple/80" 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </main>
  );
}
