
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
   const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
 
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  try {
    setIsLoading(true);
    await register(email, password);
    toast.success('✅ Registered! Check your email for the OTP.');
    navigate('/verify-otp', { state: { email } }); // pass email to OTP page
  } catch {
    setIsLoading(false);
    setError('Registration failed. Please try again.');
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
        {/* Decorative Blobs */}
        

        {/* Text Content */}
        <div className="relative z-10 p-12 text-white max-w-lg animate-fade-in-up">
          <h1 className="text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
            Join CyStar
          </h1>
          <p className="text-lg md:text-xl text-purple-200/90 font-light tracking-wide leading-relaxed">
            Unlock the next level of security. Register now to access our advanced subdomain enumeration tools and protect your digital frontier.
          </p>
        </div>
      </div>

      {/* RIGHT HALF */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-800 rounded-full blur-3xl opacity-20 animate-pulse"></div>

        <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-purple-700/40 shadow-2xl rounded-2xl p-10">
          <h2 className="text-4xl font-bold text-white mb-6 text-center">Create your account</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-purple-200 text-sm mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-purple-700/40 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-purple-200 text-sm mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-purple-700/40 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-purple-200 text-sm mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-purple-700/40 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300"
              />
            </div>

            {/* <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-700 hover:via-fuchsia-700 hover:to-pink-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Register
            </button> */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-700 hover:via-fuchsia-700 hover:to-pink-700 text-white font-semibold shadow-lg transition-all duration-300 flex items-center justify-center ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Registering...
                </span>
              ) : (
                'Register'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
