// import { useState } from 'react';
// import { useAuth } from '../../context/AuthContext';

// export function Register() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState('');
//   const { register } = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (password !== confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     try {
//       await register(email, password);
//     } catch (err) {
//       setError('Registration failed. Please try again.');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-900">
//       <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-xl shadow-lg">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
//             Create your account
//           </h2>
//         </div>
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {error && (
//             <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded relative" role="alert">
//               <span className="block sm:inline">{error}</span>
//             </div>
//           )}
//           <div className="rounded-md shadow-sm -space-y-px">
//             <div>
//               <label htmlFor="email-address" className="sr-only">
//                 Email address
//               </label>
//               <input
//                 id="email-address"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white placeholder-gray-400 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
//                 placeholder="Email address"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//             <div>
//               <label htmlFor="password" className="sr-only">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="new-password"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
//             <div>
//               <label htmlFor="confirm-password" className="sr-only">
//                 Confirm Password
//               </label>
//               <input
//                 id="confirm-password"
//                 name="confirm-password"
//                 type="password"
//                 autoComplete="new-password"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white placeholder-gray-400 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
//                 placeholder="Confirm Password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//               />
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
//             >
//               Register
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// } 
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
  const navigate = useNavigate();
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError('');

  //   if (password !== confirmPassword) {
  //     setError('Passwords do not match');
  //     return;
  //   }

  //   try {
  //   await register(email, password);
  //   toast.success('✅ Registration successful!');
  //   navigate('/login');
  // } catch {
  //   setError('Registration failed. Please try again.');
  // }

  // };
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  try {
    await register(email, password);
    toast.success('✅ Registered! Check your email for the OTP.');
    navigate('/verify-otp', { state: { email } }); // pass email to OTP page
  } catch {
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

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-700 hover:via-fuchsia-700 hover:to-pink-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
