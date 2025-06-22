// ✅ SubdomainDetailsSubfinder.tsx

import React from 'react';
import type { SubdomainSubfinder } from '../../types/subdomain';
import { X, Globe, Server, Shield, Info, CircleDot, Clipboard } from 'lucide-react';

interface SubdomainDetailsSubfinderProps {
  subdomain: SubdomainSubfinder;
  onClose: () => void;
}

const SubdomainDetailsSubfinder: React.FC<SubdomainDetailsSubfinderProps> = ({
  subdomain,
  onClose
}) => {

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-gray-900 rounded-lg shadow-lg p-8 overflow-y-auto max-h-[90vh] border border-white/10">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
          <Globe size={24} /> {subdomain.subdomain}
        </h2>

        <div className="space-y-6 text-white">

          <div className="flex items-center gap-3">
            <CircleDot className="text-green-400" />
            <span className="font-mono text-sm">
              HTTP Status: {subdomain.httpx_status_code ?? 'N/A'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="text-blue-400" />
            <span className="font-mono text-sm">
              TLS Probe Status: {subdomain.httpx_tls_probe_status ? 'Valid' : 'Invalid'}
            </span>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Server /> IP Addresses
            </h4>
            <div className="flex flex-wrap gap-2">
              {subdomain.httpx_a?.length > 0 ? (
                subdomain.httpx_a.map((ip, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-500/20 text-purple-200 border border-purple-500/30 rounded-full text-xs cursor-pointer"
                    onClick={() => copyToClipboard(ip)}
                  >
                    {ip} <Clipboard className="inline ml-1" size={12} />
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">No IPs found</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Info /> Raw Data
            </h4>
            <pre className="bg-black/30 p-4 rounded-lg text-xs overflow-x-auto border border-white/10">
              {JSON.stringify(subdomain, null, 2)}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SubdomainDetailsSubfinder;
