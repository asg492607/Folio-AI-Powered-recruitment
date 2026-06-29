import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseApp } from '@/services/firebase/app';
import { db } from '@/services/firebase/db';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        // Create recruiter profile doc
        await db.collection('recruiterProfiles').addDoc({
          userId: cred.user.uid,
          email: cred.user.email,
          role: 'Recruiter',
          name: email.split('@')[0],
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
    <div className="min-h-screen bg-[#F2EFEA] flex flex-col items-center justify-center p-6 text-brand-navy">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="mb-1 flex items-center justify-center gap-2">
          <div className="relative flex-shrink-0 w-9 h-9 flex items-center justify-center">
            <div className="absolute inset-0.5 rounded-full border-[3.5px] border-[#5B4FE9]" />
            <div className="w-3 h-3 rounded-full bg-[#FF6B35]" />
          </div>
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "23.4px",
              lineHeight: 1,
              fontWeight: 400,
            }}
          >
            <span style={{ color: "#18162A" }}>Fo</span>
            <span style={{ color: "#6554F5" }}>lio</span>
          </h1>
        </div>
        <h1 className="font-inter text-3xl font-[500] text-brand-navy tracking-tight mt-1">
          {isLogin ? 'Sign in to Folio' : 'Create an Account'}
        </h1>
        <p className="folio-mono text-[9px] uppercase tracking-[0.2em] text-[#6D6B8D] font-bold">
          Workspace authentication
        </p>
      </div>

      <div className="bg-white border border-[#ECE8E2] rounded-2xl p-10 shadow-[0_10px_35px_-10px_rgba(21,22,51,0.04)] max-w-md w-full">
        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block folio-mono text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={(event) => setEmail(event.target.value)} 
              className="input" 
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block folio-mono text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-2">
              Password
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={(event) => setPassword(event.target.value)} 
              className="input" 
              placeholder="8+ characters"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="button-primary w-full py-3.5 mt-2 flex items-center justify-center font-bold hover:bg-[#FF6B35] transition duration-150 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Enter workspace' : 'Create workspace'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-[#5B4FE9] hover:underline"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
