// import { useState } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useNavigate } from 'react-router-dom'; // ✅ ADD THIS

// export function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const { login } = useAuth();
//   const navigate = useNavigate(); // ✅ ADD THIS

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     try {
//       await login(email, password);
//       navigate('/'); // ✅ REDIRECT to your home page or dashboard
//     } catch (err) {
//       setError('Invalid email or password');
//     }
//   };

//   return (
    
//      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
//       {/* Background Pattern */}
//       <div className="absolute inset-0 opacity-10">
//         <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
//       </div>

//       {/* Curved Line Decoration */}
//       <div className="absolute inset-0 overflow-hidden">
//         <svg className="absolute top-0 right-0 w-full h-full" viewBox="0 0 1200 800" fill="none">
//           <path
//             d="M800 0C800 0 900 200 1000 400C1100 600 1200 800 1200 800"
//             stroke="url(#gradient)"
//             strokeWidth="2"
//             opacity="0.3"
//           />
//           <defs>
//             <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
//               <stop offset="0%" stopColor="#3B82F6" />
//               <stop offset="100%" stopColor="#8B5CF6" />
//             </linearGradient>
//           </defs>
//         </svg>
//       </div>

//       {/* Tree Silhouette */}
//       <div className="absolute top-0 right-0 w-1/3 h-full opacity-20">
//         <svg viewBox="0 0 300 600" className="w-full h-full">
//           <path
//             d="M150 600 L150 400 L120 380 L100 350 L80 320 L90 300 L110 290 L130 280 L140 260 L160 250 L180 260 L190 280 L210 290 L230 300 L220 320 L200 350 L180 380 L150 400"
//             fill="currentColor"
//             className="text-slate-700"
//           />
//         </svg>
//       </div>

//       <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
//         <div className="w-full max-w-md">
//           {/* Header */}
//           <div className="text-center mb-8">
//             <div className="flex items-center justify-center mb-6">
//               <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
//               <span className="text-white text-lg font-medium">CyStar Subdomain Scanner</span>
//             </div>
//             <p className="text-slate-400 text-sm mb-2">WELCOME BACK!!!!</p>
//             <h1 className="text-white text-3xl font-bold">
//               Sign in to your account<span className="text-blue-500">.</span>
//             </h1>
//             <p className="text-slate-400 text-sm mt-4">
//               New Here?{' '}
//               <a href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
//                 Create Account
//               </a>
//             </p>
//           </div>

//           {/* Form */}
//           <div className="space-y-6">
//             {error && (
//               <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
//                 <span className="text-sm">{error}</span>
//               </div>
//             )}

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-slate-300 text-sm font-medium mb-2">
//                   Email
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="email"
//                     required
//                     className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
//                     placeholder="Enter your email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                   />
//                   <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                     <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
//                     </svg>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-slate-300 text-sm font-medium mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="password"
//                     required
//                     className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
//                     placeholder="••••••••"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                   />
//                   <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                     <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                     </svg>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center justify-between text-sm">
//               <label className="flex items-center text-slate-300">
//                 <input type="checkbox" className="sr-only" />
//                 <div className="w-4 h-4 bg-slate-700 border border-slate-600 rounded mr-2 flex items-center justify-center">
//                   <svg className="w-3 h-3 text-blue-500 hidden" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 Remember me
//               </label>
//               <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
//                 Forgot password?
//               </a>
//             </div>

//             <div className="flex space-x-3">
//               <button
//                 type="button"
//                 className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200"
//               >
//                 Change method
//               </button>
//               <button
//                 type="submit"
//                 onClick={handleSubmit}
//                 className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-500/25"
//               >
//                 Sign in
//               </button>
//             </div>
//           </div>

//           {/* Footer Logo */}
//           <div className="mt-12 text-center">
//             <div className="inline-flex items-center space-x-1">
//               <div className="w-2 h-6 bg-white rounded-full"></div>
//               <div className="w-2 h-6 bg-white rounded-full opacity-60"></div>
//               <div className="w-2 h-6 bg-white rounded-full opacity-30"></div>
//               <span className="ml-2 text-white font-bold text-xl">CyStar</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setIsLoading(true);
      await login(email, password);
      navigate('/');
      setIsLoading(false);
    } catch {
      setIsLoading(false);
      setError('Invalid email or password');
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
        {/* Decorative Blobs
        <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-fuchsia-500 rounded-full blur-3xl opacity-30 animate-pulse"></div> */}

        {/* Stunning Text */}
        <div className="relative z-10 p-12 text-white max-w-lg animate-fade-in-up">
          <h1 className="text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
            CyStar Scanner
          </h1>
          <p className="text-lg md:text-xl text-purple-200/90 font-light tracking-wide leading-relaxed">
            Discover and secure every hidden corner of your domain network.
            Advanced subdomain enumeration with real-time insights, powered by cutting-edge scanning tech.
          </p>
        </div>
      </div>

      {/* RIGHT HALF */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-800 rounded-full blur-3xl opacity-20 animate-pulse"></div>

        <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-purple-700/40 shadow-2xl rounded-2xl p-10">
          <h2 className="text-4xl font-bold text-white mb-6 text-center">Sign in to CyStar</h2>

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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-purple-200">
                <input type="checkbox" className="mr-2" /> Remember me
              </label>
              <a href="#" className="text-purple-400 hover:underline">Forgot password?</a>
            </div>

            {/* <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-700 hover:via-fuchsia-700 hover:to-pink-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Sign In
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
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-purple-300 text-sm">
            New here?{' '}
            <a href="/register" className="text-purple-400 hover:underline">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
