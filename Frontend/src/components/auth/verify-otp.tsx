import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function OTPVerify() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const { setUser } = useAuth();



const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  const otpValue = otp.join('');
  if (otpValue.length !== 6) {
    setError('Please enter the complete 6-digit OTP');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ ensure cookie comes back
      body: JSON.stringify({ email, otp: otpValue }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Unexpected server response');
    }

    if (!response.ok) {
      throw new Error(data.error || 'OTP verification failed.');
    }

    // ✅ IMMEDIATELY fetch /auth/me to update AuthContext
    const meResponse = await fetch('http://localhost:5000/auth/me', {
      credentials: 'include',
    });
    if (meResponse.ok) {
      const me = await meResponse.json();
      setUser({ email: me.email, organization: me.organization });
    }

    // ✅ THEN navigate to dashboard
    navigate('/verification-success');
  } catch (err: any) {
    setError(err.message || 'OTP verification failed.');
  }
};



  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      console.log('Resending OTP...');
      // TODO: Call your backend endpoint to resend OTP here
      // Example: await fetch('/auth/resend-otp', { ... })
      setCountdown(60);
      setError('');
    } catch {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-950 overflow-hidden">
      {/* LEFT HALF */}
      <div className="hidden md:flex relative w-1/2 items-center justify-center bg-black/70 backdrop-blur-md">
        <img
          src="https://i.pinimg.com/736x/f8/75/0e/f8750e99f1777350f4cf2ec820ee9838.jpg"
          alt="Cyber Security"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />

        <div className="relative z-10 p-12 text-white max-w-lg animate-fade-in-up">
          <h1 className="text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
            CyStar Scanner
          </h1>
          <p className="text-lg md:text-xl text-purple-200/90 font-light tracking-wide leading-relaxed">
            Secure your access with our advanced two-factor authentication.
            Your security is our priority in every scan and discovery.
          </p>
        </div>
      </div>

      {/* RIGHT HALF */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-800 rounded-full blur-3xl opacity-20 animate-pulse"></div>

        <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-purple-700/40 shadow-2xl rounded-2xl p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Verify Your Identity</h2>
            <p className="text-purple-300 text-sm">
              We've sent a 6-digit code to your registered email.
              <br />Enter the code below to continue.
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  autoFocus={index === 0}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold bg-white/10 border border-purple-700/40 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300"
                  placeholder="_"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-700 hover:via-fuchsia-700 hover:to-pink-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Verify OTP
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-purple-300 text-sm mb-3">
              Didn't receive the code?
            </p>

            {countdown > 0 ? (
              <p className="text-purple-400 text-sm">
                Resend code in {countdown}s
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-purple-400 hover:text-purple-300 text-sm transition-colors flex items-center justify-center mx-auto"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
