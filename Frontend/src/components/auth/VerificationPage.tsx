import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function VerificationSuccess() {
  const [countdown, setCountdown] = useState(10);
  const [showAnimation, setShowAnimation] = useState(false);
  const navigate=useNavigate();
  // Auto-redirect countdown
//   useEffect(() => {
//     setShowAnimation(true);
    
//     const timer = setInterval(() => {
//       setCountdown(prev => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           // Replace with actual navigation
//           navigate('/login');
//           console.log('Redirecting to login');
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);
useEffect(() => {
  setShowAnimation(true);

  const timer = setInterval(() => {
    setCountdown(prev => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0; // stop at 0
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, []);

useEffect(() => {
  if (countdown === 0) {
    navigate('/');
    console.log('Redirecting to login');
  }
}, [countdown, navigate]);


  const handleContinue = () => {
    // Replace with your actual navigation logic
    console.log('Navigating to dashboard...');
    alert('Redirecting to dashboard...');
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

        {/* Success Animation Circles */}
        {/* <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-emerald-500 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-400 rounded-full blur-3xl opacity-15 animate-pulse delay-500"></div>
        </div> */}

        {/* Stunning Text */}
        <div className="relative z-10 p-12 text-white max-w-lg">
          <h1 className="text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent drop-shadow-lg">
            Access Granted
          </h1>
          <p className="text-lg md:text-xl text-green-200/90 font-light tracking-wide leading-relaxed">
            Your identity has been successfully verified. Welcome to the secure network of CyStar Scanner - where advanced security meets seamless access.
          </p>
        </div>
      </div>

      {/* RIGHT HALF */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative">
        {/* Animated Success Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-green-400 rounded-full opacity-60 animate-bounce`}
              style={{
                left: `${20 + i * 12}%`,
                top: `${30 + i * 8}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '2s'
              }}
            ></div>
          ))}
        </div>

        <div className="absolute top-0 right-0 w-72 h-72 bg-green-800 rounded-full blur-3xl opacity-20 animate-pulse"></div>

        <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-green-700/40 shadow-2xl rounded-2xl p-10 text-center">
          
          {/* Animated Success Icon */}
          <div className={`relative mb-8 transition-all duration-1000 ${showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
              {/* Success checkmark animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-ping opacity-20"></div>
              <svg 
                className={`w-12 h-12 text-white transition-all duration-1000 delay-500 ${showAnimation ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7"
                  className="animate-draw"
                />
              </svg>
            </div>
            
            {/* Ripple effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 border-2 border-green-400 rounded-full animate-ping opacity-30"></div>
            </div>
          </div>

          <div className={`transition-all duration-1000 delay-300 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h2 className="text-4xl font-bold text-white mb-4">Verification Complete!</h2>
            <p className="text-green-300 text-lg mb-2 font-medium">
              🎉 Welcome to CyStar Scanner
            </p>
            <p className="text-purple-300 text-sm mb-8 leading-relaxed">
              Your account has been successfully verified and secured. 
              You now have full access to your organisation's scanning features and advanced security tools.
            </p>
          </div>

          {/* Auto-redirect notice */}
          <div className={`transition-all duration-1000 delay-700 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center text-green-400 text-sm">
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {countdown > 0 ? (
                  <span>Redirecting to Scanner in {countdown} seconds...</span>
                ) : (
                  <span>Redirecting now...</span>
                )}
              </div>
            </div>

           
          </div>

          {/* Security Badge */}
          <div className={`mt-8 transition-all duration-1000 delay-1000 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex items-center justify-center space-x-2 text-green-400 text-xs">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secured by CyStar Advanced Encryption</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes draw {
          0% {
            stroke-dasharray: 0, 100;
          }
          100% {
            stroke-dasharray: 100, 0;
          }
        }
        
        .animate-draw {
          animation: draw 1s ease-in-out 0.8s both;
        }
      `}</style>
    </div>
  );
}