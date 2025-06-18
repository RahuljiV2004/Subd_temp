import { useState } from 'react';
import { Search, Loader2, ShieldCheck, Radar, AlertCircle } from 'lucide-react';
import Typewriter from 'typewriter-effect';

interface DomainInputProps {
  onScan: (domain: string) => Promise<void>;
  isLoading: boolean;
}

export function DomainInput({ onScan, isLoading }: DomainInputProps) {
  const [domain, setDomain] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      await onScan(domain.trim());
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
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
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
