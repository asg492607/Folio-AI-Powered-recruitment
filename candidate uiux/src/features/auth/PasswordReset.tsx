import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { AuthShell } from './AuthShell';

export function PasswordReset() {
  const [sent, setSent] = useState(false);

  return (
    <AuthShell title="Reset password" subtitle="We’ll send a mock reset link so the demo flow stays complete.">
      {sent ? (
        <div className="space-y-4">
          <p className="rounded-xl bg-mint-50 p-4 text-sm text-mint-600 border border-mint-100">Reset email sent. Check your inbox for the next step.</p>
          <Link className="font-semibold text-indigo hover:text-indigo-700 transition-colors" to="/login">Back to login</Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="field mt-1" required />
          </div>
          <Button className="w-full" type="submit">Send reset link</Button>
        </form>
      )}
    </AuthShell>
  );
}
