import { useState } from 'react';
import { Search, Loader2, ShieldCheck, Radar, AlertCircle } from 'lucide-react';
import Typewriter from 'typewriter-effect';

// interface DomainInputProps {
//   onScan: (domain: string) => Promise<void>;
//   isLoading: boolean;
// }
interface DomainInputProps {
  onScan: (domain: string, tool: string) => Promise<void>;
  selectedTool: string;
  setSelectedTool: (tool: string) => void;
  isLoading: boolean;
}


export function DomainInput({ onScan, isLoading, selectedTool, setSelectedTool }: DomainInputProps) {
  const [domain, setDomain] = useState('');
  // const [selectedTool, setSelectedTool] = useState('knockpy');

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (domain.trim()) {
  //     await onScan(domain.trim());
  //   }
  // };
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (domain.trim()) {
    await onScan(domain.trim(), selectedTool);
  }
};

  return (
    <div className="relative">
      {/* Background Blur */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-3xl" />

      <div className="relative">
        {/* Typewriter */}
        <div className="text-center mb-8">
          <Typewriter
            options={{
              strings: ['Find Hidden Subdomains.', 'Detect Risks.', 'Stay Ahead.'],
              autoStart: true,
              loop: true,
              wrapperClassName: 'text-2xl sm:text-3xl font-bold text-white',
              cursorClassName: 'text-white',
            }}
          />
        </div>

        {/* Form */}
        {/* <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="relative group">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter domain (e.g., example.com)"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 group-hover:border-purple-500/50"
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
          </div>

          <button
            type="submit"
            disabled={isLoading || !domain.trim()}
            className="mt-4 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Scan Now
              </>
            )}
          </button>
        </form> */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
  {/* DOMAIN INPUT + TOOL SELECT INLINE */}
  <div className="flex flex-col sm:flex-row gap-4">
    <div className="relative group flex-1">
      <input
        type="text"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="Enter domain (e.g., example.com)"
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 group-hover:border-purple-500/50"
      />
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
    </div>

<div className="relative group w-full sm:w-40">
  <select
    value={selectedTool}
    onChange={(e) => setSelectedTool(e.target.value)}
    className="
      w-full px-4 py-3
      rounded-xl
      bg-zinc-900/50
      border border-purple-700
      text-white font-medium
      backdrop-blur-sm
      focus:outline-none focus:ring-2 focus:ring-purple-600/70
      transition-all duration-300
      appearance-none
      shadow-lg shadow-black/30
    "
  >
    <option value="knockpy" className="text-white bg-zinc-900">Knockpy</option>
    <option value="subfinder" className="text-white bg-zinc-900">Subfinder</option>
  </select>

  {/* Hover + focus gradient effect */}
  <div
    className="
      absolute inset-0 rounded-xl
      bg-gradient-to-r from-purple-700/40 to-blue-700/40
      opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
      transition-opacity duration-300
      -z-10 blur-xl
    "
  />

  {/* Arrow icon with open animation */}
  <div
    className="
      pointer-events-none absolute inset-y-0 right-0 flex items-center px-4
      text-zinc-400 transition-transform duration-300"
      
  >
    ▼
  </div>
</div>


  </div>

  {/* SUBMIT BUTTON */}
  <button
    type="submit"
    disabled={isLoading || !domain.trim()}
    className="mt-4 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
  >
    {isLoading ? (
      <>
        <Loader2 className="w-5 h-5 animate-spin" />
        Scanning...
      </>
    ) : (
      <>
        <Search className="w-5 h-5" />
        Scan Now
      </>
    )}
  </button>
</form>


       {/* Feature Cards */}
<div className="mt-12 grid gap-6 md:grid-cols-3">
  {/* Card 1 */}
  <div className="relative group p-6 bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-2xl text-white shadow-lg overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:border-purple-500/50 hover:shadow-purple-500/30">
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10" />
    <ShieldCheck className="w-10 h-10 mb-4 text-purple-400 transition-transform duration-500 group-hover:rotate-[10deg]" />
    <h3 className="text-xl font-bold mb-2">Secure Your Domain</h3>
    <p className="text-sm text-white/80 leading-relaxed">
      Identify hidden subdomains to prevent unauthorized access and secure your attack surface.
    </p>
  </div>

  {/* Card 2 */}
  <div className="relative group p-6 bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-2xl text-white shadow-lg overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:border-purple-500/50 hover:shadow-purple-500/30">
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10" />
    <Radar className="w-10 h-10 mb-4 text-purple-400 transition-transform duration-500 group-hover:rotate-[10deg]" />
    <h3 className="text-xl font-bold mb-2">Deep Recon</h3>
    <p className="text-sm text-white/80 leading-relaxed">
      Perform in-depth scanning to uncover overlooked assets and monitor your digital footprint.
    </p>
  </div>

  {/* Card 3 */}
  <div className="relative group p-6 bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-2xl text-white shadow-lg overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:border-purple-500/50 hover:shadow-purple-500/30">
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10" />
    <AlertCircle className="w-10 h-10 mb-4 text-purple-400 transition-transform duration-500 group-hover:rotate-[10deg]" />
    <h3 className="text-xl font-bold mb-2">Risk Detection</h3>
    <p className="text-sm text-white/80 leading-relaxed">
      Instantly detect potential security risks linked to your domains and stay ahead of threats.
    </p>
  </div>
  
</div>

      </div>
    </div>
  );
}
// import { useState } from 'react';
// import { Search, Loader2, ShieldCheck, Radar, AlertCircle } from 'lucide-react';
// import Typewriter from 'typewriter-effect';
// import { useTheme } from '../../context/ThemeContext';

// interface DomainInputProps {
//   onScan: (domain: string, tool: string) => Promise<void>;
//   selectedTool: string;
//   setSelectedTool: (tool: string) => void;
//   isLoading: boolean;
// }

// export function DomainInput({ onScan, isLoading, selectedTool, setSelectedTool }: DomainInputProps) {
//   const [domain, setDomain] = useState('');
//   const { colorPalette } = useTheme();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (domain.trim()) {
//       await onScan(domain.trim(), selectedTool);
//     }
//   };

//   return (
//     <div className="relative py-16 sm:py-20">
//       <div className="container mx-auto px-4">
//         {/* Typewriter */}
//         <div className="text-center mb-8">
//           <Typewriter
//             options={{
//               strings: ['Find Hidden Subdomains.', 'Detect Risks.', 'Stay Ahead.'],
//               autoStart: true,
//               loop: true,
//               wrapperClassName: 'text-2xl sm:text-3xl font-bold text-[var(--color-text)]',
//               cursorClassName: 'text-[var(--color-text)]',
//             }}
//           />
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
//           <div className="flex flex-col sm:flex-row gap-4">
//             <input
//               type="text"
//               value={domain}
//               onChange={(e) => setDomain(e.target.value)}
//               placeholder="Enter domain (e.g., example.com)"
//               className="w-full px-4 py-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
//             />

//             <select
//               value={selectedTool}
//               onChange={(e) => setSelectedTool(e.target.value)}
//               className="w-full sm:w-40 px-4 py-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
//             >
//               <option value="knockpy">Knockpy</option>
//               <option value="subfinder">Subfinder</option>
//             </select>
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading || !domain.trim()}
//             className="mt-4 w-full sm:w-auto px-6 py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="w-5 h-5 animate-spin" />
//                 Scanning...
//               </>
//             ) : (
//               <>
//                 <Search className="w-5 h-5" />
//                 Scan Now
//               </>
//             )}
//           </button>
//         </form>

//         {/* Feature Cards */}
//         <div className="mt-12 grid gap-6 md:grid-cols-3">
//           {[
//             {
//               icon: <ShieldCheck className="w-8 h-8 text-[var(--color-primary)]" />,
//               title: 'Secure Your Domain',
//               desc: 'Identify hidden subdomains to prevent unauthorized access and secure your attack surface.',
//             },
//             {
//               icon: <Radar className="w-8 h-8 text-[var(--color-primary)]" />,
//               title: 'Deep Recon',
//               desc: 'Perform in-depth scanning to uncover overlooked assets and monitor your digital footprint.',
//             },
//             {
//               icon: <AlertCircle className="w-8 h-8 text-[var(--color-primary)]" />,
//               title: 'Risk Detection',
//               desc: 'Instantly detect potential security risks linked to your domains and stay ahead of threats.',
//             },
//           ].map(({ icon, title, desc }, idx) => (
//             <div
//               key={idx}
//               className="p-6 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] shadow-md transition-all hover:shadow-lg"
//             >
//               <div className="mb-3">{icon}</div>
//               <h3 className="text-lg font-semibold mb-2">{title}</h3>
//               <p className="text-sm text-[var(--color-text)]/80">{desc}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
