import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Compass, CheckCircle2, AlertCircle, ArrowRight, Mail } from 'lucide-react';
import { useToast } from '../../components/ui/Toast.jsx';

export function MagicLoginPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { verifyMagicLogin } = useAuth();
  const toast = useToast();

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No sign-in token was provided in the link. Please check the email link or request a new one.');
      return;
    }

    let isMounted = true;

    async function handleVerification() {
      try {
        const user = await verifyMagicLogin(token);
        if (isMounted) {
          setUserProfile(user);
          setStatus('success');
          toast.success(`Welcome, ${user.name}! Sign-in successful.`);
          
          // Auto-redirect after short animation
          setTimeout(() => {
            if (user.role === 'admin') {
              navigate('/admin/dashboard', { replace: true });
            } else {
              navigate('/client/dashboard', { replace: true });
            }
          }, 1500);
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err.message || 'The sign-in link is invalid or has expired. Please request a new link.');
        }
      }
    }

    handleVerification();

    return () => {
      isMounted = false;
    };
  }, [token, verifyMagicLogin, navigate, toast]);

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/20 mb-2">
            <Compass className="size-6" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white text-balance">Email Authentication</h2>
          <p className="text-sm text-slate-400 text-pretty">Verifying your secure passwordless sign-in token</p>
        </div>

        <Card className="p-8 border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl text-center">
          {status === 'verifying' && (
            <div className="py-8 space-y-4" role="status" aria-live="polite">
              <div className="size-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-white text-balance">Authenticating your session...</h3>
              <p className="text-xs text-slate-400 text-pretty">
                Please wait a moment while we verify your magic login credentials and connect to your dashboard.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-6 space-y-4" role="status">
              <div className="size-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-7" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-white text-balance">Verified Successfully!</h3>
              <p className="text-sm text-slate-300 text-pretty">
                Welcome back, <span className="font-semibold text-white">{userProfile?.name}</span> ({userProfile?.role}).
              </p>
              <p className="text-xs text-slate-400 text-pretty">
                Redirecting you to your {userProfile?.role === 'admin' ? 'Admin Studio' : 'Learner Dashboard'}...
              </p>
              <Button
                variant="primary"
                className="w-full mt-4"
                onClick={() => {
                  if (userProfile?.role === 'admin') {
                    navigate('/admin/dashboard', { replace: true });
                  } else {
                    navigate('/client/dashboard', { replace: true });
                  }
                }}
                icon={ArrowRight}
              >
                Go to Dashboard Now
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="py-6 space-y-4">
              <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-white">Sign-in Link Failed</h3>
              <p className="text-xs text-rose-300 bg-rose-950/40 border border-rose-900/50 p-3 rounded-xl text-left">
                {errorMessage}
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login">
                  <Button variant="primary" className="w-full" icon={Mail}>
                    Request a New Magic Link
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
