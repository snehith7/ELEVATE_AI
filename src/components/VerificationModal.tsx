import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  X,
  CheckCircle2,
  Lock,
  Clock
} from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
  onEmailChangeRequested?: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  email,
  onClose,
  onSuccess,
  onEmailChangeRequested
}) => {
  // 6 separate digits for OTP code
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 10-minute countdown timer (600 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // Focus the first input on open
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setErrorMsg(null);
      setSuccessMsg(null);
      setTimeLeft(600);
      setIsExpired(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen, email]);

  // Timer countdown effect
  useEffect(() => {
    if (!isOpen) return;

    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timeLeft]);

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDigitChange = (index: number, val: string) => {
    // Only permit digits
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      setDigits(nextDigits);
      return;
    }

    // If multiple characters are typed/pasted into a single box
    if (cleaned.length > 1) {
      handlePasteData(cleaned);
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = cleaned[0];
    setDigits(nextDigits);
    setErrorMsg(null);

    // Auto-advance to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous box if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    handlePasteData(paste);
  };

  const handlePasteData = (data: string) => {
    const numbersOnly = data.replace(/\D/g, '').slice(0, 6);
    if (!numbersOnly) return;

    const nextDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < numbersOnly.length; i++) {
      nextDigits[i] = numbersOnly[i];
    }
    setDigits(nextDigits);
    setErrorMsg(null);

    // Focus on the next empty box or the last box
    const focusIndex = Math.min(numbersOnly.length, 5);
    inputRefs.current[focusIndex]?.focus();

    // If a full 6-digit code was pasted, immediately attempt verification
    if (numbersOnly.length === 6) {
      submitCode(numbersOnly);
    }
  };

  const submitCode = async (fullCode: string) => {
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: fullCode
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed. Please check your code.');
      }

      setSuccessMsg('Account verified successfully! Directing you to your academy dashboard...');
      
      // Allow user to see the success confirmation briefly, then complete login
      setTimeout(() => {
        onSuccess(data.user, data.token);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = digits.join('');
    submitCode(fullCode);
  };

  const handleResend = async () => {
    setIsResending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend verification code.');
      }

      setDigits(['', '', '', '', '', '']);
      setTimeLeft(600); // Reset to 10 minutes
      setIsExpired(false);
      setSuccessMsg('A new 6-digit verification code has been dispatched to your email.');
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  const isFullCode = digits.every(d => d.length === 1);

  return (
    <div
      id="email-verification-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 selection:bg-[#FF5A43]/30 selection:text-white"
    >
      <div
        id="email-verification-modal-card"
        className="w-full max-w-md bg-[#0d0d14] border border-[#222230] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black relative overflow-hidden text-slate-100"
      >
        {/* Subtle Ambient Coral Glow */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-[#FF5A43]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-[#FF5A43]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="verification-modal-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1a26] transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF5A43]/20 to-[#FF8570]/10 border border-[#FF5A43]/30 text-[#FF5A43] shadow-lg shadow-[#FF5A43]/15 mb-2">
            <Mail className="w-7 h-7 text-[#FF5A43]" />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF5A43]/10 text-[#FF8570] border border-[#FF5A43]/30">
            <ShieldCheck className="w-3 h-3 text-[#FF5A43]" />
            <span>Email Verification Required</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            Enter Verification Code
          </h2>

          <div className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            <span>We sent a 6-digit confirmation code to</span>
            <div className="font-semibold text-slate-200 break-all mt-0.5 flex items-center justify-center gap-1.5">
              <span>{email}</span>
              {onEmailChangeRequested && (
                <button
                  type="button"
                  onClick={onEmailChangeRequested}
                  className="text-[11px] text-[#FF8570] hover:underline ml-1 font-normal cursor-pointer"
                >
                  (Edit)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start space-x-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{successMsg}</div>
          </div>
        )}

        {/* 6-Digit OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={el => (inputRefs.current[idx] = el)}
                id={`verification-otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={e => handleDigitChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                disabled={isLoading}
                autoComplete="one-time-code"
                className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-black font-mono rounded-xl border bg-[#13131c] text-white focus:outline-none transition-all shadow-inner ${
                  errorMsg
                    ? 'border-rose-500/50 focus:border-rose-500'
                    : digit
                    ? 'border-[#FF5A43] ring-1 ring-[#FF5A43]/30 bg-[#161622]'
                    : 'border-[#272738] focus:border-[#FF5A43] focus:ring-2 focus:ring-[#FF5A43]/25'
                }`}
              />
            ))}
          </div>

          {/* Expiration Countdown & Resend Section */}
          <div className="flex items-center justify-between text-xs pt-1 px-1">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-[#FF5A43]" />
              {isExpired ? (
                <span className="text-rose-400 font-semibold">Code expired</span>
              ) : (
                <span>
                  Expires in <strong className="text-slate-200 font-mono">{formatTime(timeLeft)}</strong>
                </span>
              )}
            </div>

            <button
              type="button"
              id="resend-verification-otp-btn"
              onClick={handleResend}
              disabled={isResending || isLoading}
              className="inline-flex items-center space-x-1 text-[#FF8570] hover:text-white transition-colors font-semibold cursor-pointer disabled:opacity-40"
            >
              <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
              <span>{isResending ? 'Resending...' : 'Resend Code'}</span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="submit-email-verification-btn"
            disabled={!isFullCode || isLoading}
            className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#FF5A43] via-[#FF6A54] to-[#FFA07A] hover:from-[#F04428] hover:to-[#FF5A43] text-white shadow-lg shadow-[#FF5A43]/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-40 hover:scale-[1.01]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Validating Code...</span>
              </>
            ) : (
              <>
                <span>Verify & Activate Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Development Helper Box */}
        <div className="mt-5 p-3 rounded-xl bg-[#14141e] border border-[#222230] text-[11px] text-slate-400 flex items-start space-x-2">
          <Lock className="w-3.5 h-3.5 text-[#FF5A43] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="text-slate-300 font-medium">Testing locally?</span> The 6-digit OTP code is dispatched via Nodemailer and prominently logged to your server terminal output.Check your Spam-Folder.
          </div>
        </div>
      </div>
    </div>
  );
};
