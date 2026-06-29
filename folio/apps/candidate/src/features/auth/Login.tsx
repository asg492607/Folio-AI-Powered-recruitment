import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { loginWithEmail, loginWithGoogle } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { trackSessionStart } from '../../utils/analytics';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters'),
});

type LoginValues = z.infer<typeof schema>;

export function Login() {
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'maya@example.com', password: 'password123' },
  });

  async function finishLogin(values?: LoginValues) {
    const session = values
      ? await loginWithEmail(values.email, values.password)
      : await loginWithGoogle();
    setSession(session.token, session.candidate);
    trackSessionStart();
    toast.success('You’re back.');
    navigate('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-chalk px-4 py-12 font-sans">
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
        <h1 className="text-h1 text-navy mb-3">Log in</h1>
        <p className="text-navy/60 font-sans text-[15px] leading-relaxed max-w-sm mx-auto">
          Keep tracking roles, portfolio feedback, and next steps in one place.
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-8 shadow-card sm:p-10 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <form className="space-y-5" onSubmit={form.handleSubmit(finishLogin)}>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" className="field mt-1.5" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="mt-1.5 text-xs text-orange-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="field mt-1.5"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="mt-1.5 text-xs text-orange-600">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 pb-3 text-[13px]">
            <Link
              className="font-medium text-navy/60 transition-colors hover:text-indigo"
              to="/reset-password"
            >
              Reset password
            </Link>
            <Link
              className="font-medium text-indigo transition-colors hover:text-indigo-700"
              to="/signup"
            >
              Create account
            </Link>
          </div>

          <div className="pt-1">
            <Button size="lg" className="w-full bg-indigo hover:bg-indigo-600 text-white" type="submit">
              Log in
            </Button>
            
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-chalk-200"></div>
              <span className="mx-4 text-[13px] text-navy/40">or</span>
              <div className="flex-1 border-t border-chalk-200"></div>
            </div>

            <Button
              size="lg"
              className="w-full border-chalk-200 text-navy hover:bg-chalk-50"
              type="button"
              variant="secondary"
              onClick={() => finishLogin()}
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
      </div>
    </main>
  );
}
