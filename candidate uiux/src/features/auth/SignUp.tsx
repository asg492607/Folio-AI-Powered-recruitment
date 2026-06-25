import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { signupWithEmail, loginWithGoogle } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { useCandidateStore } from '../../store/candidateStore';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters'),
});

type SignUpValues = z.infer<typeof schema>;

export function SignUp() {
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const setSession = useAuthStore((state) => state.setSession);
  const updateCandidate = useCandidateStore((state) => state.updateCandidate);
  const navigate = useNavigate();
  const form = useForm<SignUpValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: SignUpValues) {
    // Create auth account with name — saves to Firestore immediately
    const session = await signupWithEmail(values.email, role, values.password, values.name);
    setSession(session.token, session.candidate);
    // Also push name into the candidate store so it shows instantly
    updateCandidate({ personalInfo: { ...session.candidate.personalInfo, name: values.name } });
    toast.success('Welcome in. Let\'s shape your profile.');
    navigate('/onboarding');
  }

  async function googleSignup() {
    const session = await loginWithGoogle();
    setSession(session.token, session.candidate);
    navigate('/onboarding');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-chalk px-4 py-12">
      {/* Header outside the card */}
      <div className="mb-10 text-center animate-slide-up">
        <div className="mb-6 flex justify-center">
          <Link to="/" className="flex items-center gap-2.5 text-decoration-none">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-indigo">
              <span className="absolute h-2.5 w-2.5 rounded-full bg-indigo opacity-25" />
              <span className="h-1.5 w-1.5 rounded-full bg-orange" />
            </span>
            <span className="font-serif text-2xl tracking-tight text-navy">Folio</span>
          </Link>
        </div>
        <h1 className="text-h1 text-navy mb-2">Create your account</h1>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-8 shadow-card sm:p-10 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          
          {/* Segmented Control */}
          <div>
            <label className="mb-2 block font-sans text-sm font-medium text-navy">I am a</label>
            <div className="flex rounded-lg border border-chalk-200 bg-white p-1">
              <button
                type="button"
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  role === 'candidate' ? 'bg-navy text-white' : 'text-navy/70 hover:text-navy'
                }`}
                onClick={() => setRole('candidate')}
              >
                Design candidate
              </button>
              <button
                type="button"
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  role === 'recruiter' ? 'bg-navy text-white' : 'text-navy/70 hover:text-navy'
                }`}
                onClick={() => setRole('recruiter')}
              >
                Recruiter / Hiring
              </button>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input id="name" placeholder="Avni Sharma" className="field mt-1.5" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="mt-1.5 text-xs text-orange-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" placeholder="you@example.com" className="field mt-1.5" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="mt-1.5 text-xs text-orange-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="8+ characters"
              className="field mt-1.5"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="mt-1.5 text-xs text-orange-600">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="pt-2">
            <Button size="lg" className="w-full bg-indigo hover:bg-indigo-600 text-white" type="submit">
              Create account
            </Button>
            
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-chalk-200"></div>
              <span className="mx-4 text-sm text-navy/40">or</span>
              <div className="flex-1 border-t border-chalk-200"></div>
            </div>

            <Button
              size="lg"
              className="w-full border-chalk-200 text-navy hover:bg-chalk-50"
              type="button"
              variant="secondary"
              onClick={googleSignup}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Continue with Google
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-navy/60">
          Already have one?{' '}
          <Link className="font-medium text-indigo hover:text-indigo-700" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
