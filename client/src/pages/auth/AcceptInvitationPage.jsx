import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Compass, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../components/ui/Toast.jsx';

export function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [invitationInfo, setInvitationInfo] = useState(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { acceptInvitation } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!token) {
      setError('Missing invitation token.');
      setLoadingToken(false);
      return;
    }

    const verify = async () => {
      try {
        setLoadingToken(true);
        const res = await api.get(`/auth/invitations/${token}`);
        if (res.success && res.data) {
          setInvitationInfo(res.data);
        }
      } catch (err) {
        setError(err.message || 'Invitation is invalid, expired, or already used.');
      } finally {
        setLoadingToken(false);
      }
    };

    verify();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await acceptInvitation({ token, name, password });
      toast.success('Invitation accepted! Welcome to your learning journey.');
      navigate('/client/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to accept invitation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingToken) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-950 text-slate-400" role="status" aria-live="polite">
        <div className="flex items-center gap-3">
          <div className="size-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <span>Verifying invitation link...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4 bg-slate-950">
        <Card className="max-w-md w-full p-8 text-center space-y-4 border-rose-900/40 bg-slate-900/90">
          <AlertTriangle className="size-12 text-rose-500 mx-auto" aria-hidden="true" />
          <h3 className="text-lg font-bold text-white text-balance">Invalid Invitation</h3>
          <p className="text-xs text-slate-300 text-pretty">{error}</p>
          <Button variant="secondary" onClick={() => navigate('/login')}>
            Return to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/20 mb-2">
            <Compass className="size-6" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white text-balance">Accept Invitation</h2>
          <p className="text-xs text-slate-400 text-pretty">
            {invitationInfo?.inviter} assigned you: <strong className="text-blue-400">{invitationInfo?.roadmap?.title}</strong>
          </p>
        </div>

        <Card className="p-8 border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email (Verified)</label>
              <input
                type="email"
                disabled
                value={invitationInfo?.email || ''}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Choose Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" loading={submitting} icon={ArrowRight}>
              Activate &amp; Start Learning
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-slate-950">
      <Card className="max-w-md w-full p-8 border-slate-800 bg-slate-900/90 text-center space-y-4">
        <h3 className="text-xl font-bold text-white text-balance">Reset Password</h3>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <p className="text-xs text-slate-400 text-pretty">
              Enter your email address to receive password reset instructions.
            </p>
            <input
              type="email"
              required
              aria-label="Email address for password reset"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus-visible:outline-none focus-visible:border-blue-500"
            />
            <Button type="submit" variant="primary" className="w-full" loading={loading}>
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <CheckCircle2 className="size-10 text-emerald-400 mx-auto" aria-hidden="true" />
            <p className="text-xs text-slate-300 text-pretty">
              If an account with that email exists, reset instructions have been captured.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
